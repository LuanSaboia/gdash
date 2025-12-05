import os
import time
import json
import requests
import pika

# Configurações do Ambiente
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
LAT = os.getenv("LATITUDE", "-5.17833")
LON = os.getenv("LONGITUDE", "-40.6775")
CITY = os.getenv("CITY", "Crateús") # Nome da cidade para o log
INTERVAL = int(os.getenv("INTERVAL_MINUTES", "60"))

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Mapa de códigos WMO para texto (Open-Meteo usa números)
WEATHER_CODES = {
    0: "Céu limpo",
    1: "Predominantemente limpo", 2: "Parcialmente nublado", 3: "Encoberto",
    45: "Nevoeiro", 48: "Nevoeiro com geada",
    51: "Garoa leve", 53: "Garoa moderada", 55: "Garoa densa",
    61: "Chuva fraca", 63: "Chuva moderada", 65: "Chuva forte",
    80: "Pancadas de chuva leve", 81: "Pancadas de chuva moderada", 82: "Pancadas de chuva violenta",
    95: "Trovoada", 96: "Trovoada com granizo leve", 99: "Trovoada com granizo forte"
}

def get_condition_text(code):
    return WEATHER_CODES.get(code, "Desconhecido")

def connect_rabbit():
    params = pika.URLParameters(RABBITMQ_URL)
    while True:
        try:
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            # Garante que a fila existe
            channel.queue_declare(queue='weather_queue', durable=True)
            print("✅ [Python] Conectado ao RabbitMQ!")
            return connection, channel
        except Exception as e:
            print(f"⏳ [Python] RabbitMQ indisponível ({e}). Tentando em 5s...")
            time.sleep(5)

def fetch_weather():
    try:
        print("🌍 [Python] Buscando dados no Open-Meteo...")
        params = {
            "latitude": LAT,
            "longitude": LON,
            "current_weather": "true",
            "hourly": "relativehumidity_2m", # Necessário para pegar a umidade atual
            "timezone": "auto"
        }
        response = requests.get(OPEN_METEO_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extrair dados atuais
        current = data.get("current_weather", {})
        
        # Lógica para pegar umidade (que não vem no current_weather padrão)
        current_time_iso = current.get("time")
        hourly_times = data.get("hourly", {}).get("time", [])
        hourly_humidity = data.get("hourly", {}).get("relativehumidity_2m", [])
        
        humidity = 0
        if current_time_iso in hourly_times:
            idx = hourly_times.index(current_time_iso)
            humidity = hourly_humidity[idx]

        # --- AQUI ESTÁ A MÁGICA ---
        # Criamos o JSON PLANO exato que o Go/NestJS esperam
        payload = {
            "city": CITY,
            "temperature": float(current.get("temperature", 0)),
            "humidity": float(humidity),
            "windSpeed": float(current.get("windspeed", 0)),
            "condition": get_condition_text(current.get("weathercode", 0))
        }
        
        return payload

    except Exception as e:
        print(f"❌ [Python] Erro ao buscar clima: {e}")
        return None

def main():
    print(f"🚀 Iniciando Coletor para {CITY} ({LAT}, {LON})...")
    
    # Conexão resiliente (tenta reconectar se cair)
    while True:
        try:
            connection, channel = connect_rabbit()
            
            while True:
                data = fetch_weather()
                
                if data:
                    message = json.dumps(data)
                    channel.basic_publish(
                        exchange='',
                        routing_key='weather_queue',
                        body=message,
                        properties=pika.BasicProperties(delivery_mode=2)
                    )
                    print(f"📤 [Python] Enviado para fila: {message}")
                
                print(f"💤 [Python] Aguardando {INTERVAL} minutos...")
                time.sleep(INTERVAL * 60)
                
        except (pika.exceptions.AMQPConnectionError, pika.exceptions.StreamLostError):
            print("⚠️ [Python] Conexão com RabbitMQ perdida. Reconectando...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("🛑 [Python] Parando coletor...")
            break
        except Exception as e:
            print(f"❌ [Python] Erro inesperado: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()