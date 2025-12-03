import os
import time
import json
import requests
import pika
from datetime import datetime

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
LAT = os.getenv("LATITUDE", "-5.17833")
LON = os.getenv("LONGITUDE", "-40.6775")
INTERVAL = int(os.getenv("INTERVAL_MINUTES", "60"))

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
HOURLY_VARS = "temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability,weathercode"

def extract_current_humidity(data):
    try:
        hourly_times = data.get("hourly", {}).get("time", [])
        humidity_values = data.get("hourly", {}).get("relativehumidity_2m", [])
        current_time = data.get("current_weather", {}).get("time")

        if current_time in hourly_times:
            index = hourly_times.index(current_time)
            return humidity_values[index]

    except Exception as e:
        print("Erro extraindo umidade atual:", e)

    return None

def fetch_weather(lat, lon):
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": HOURLY_VARS,
        "current_weather": "true",
        "timezone": "auto"
    }

    print("Buscando dados de clima em Open-Meteo...")
    response = requests.get(OPEN_METEO_URL, params=params, timeout=15)
    response.raise_for_status()
    return response.json()

def connect_rabbit(url):
    params = pika.URLParameters(url)

    while True:
        try:
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue='weather_queue', durable=True)
            print("Conectado ao RabbitMQ!")
            return connection, channel

        except Exception:
            print("RabbitMQ não está pronto ainda... tentando novamente em 5 segundos...")
            time.sleep(5)

def publish_weather(channel, data):
    current = data.get("current_weather", {})

    # Obter umidade atual já corrigida
    humidity_now = extract_current_humidity(data)

    current_weather = {
        "temperature": current.get("temperature"),
        "windspeed": current.get("windspeed"),
        "winddirection": current.get("winddirection"),
        "weathercode": current.get("weathercode"),
        "time": current.get("time"),
        "humidity": humidity_now  # <-- agora existe!
    }

    payload = {
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "latitude": LAT,
        "longitude": LON,
        "current_weather": current_weather,
        "hourly": {
            "time": data.get("hourly", {}).get("time", []),
            "temperature_2m": data.get("hourly", {}).get("temperature_2m", []),
            "relativehumidity_2m": data.get("hourly", {}).get("relativehumidity_2m", []),
            "windspeed_10m": data.get("hourly", {}).get("windspeed_10m", []),
            "precipitation_probability": data.get("hourly", {}).get("precipitation_probability", [])
        }
    }

    message = json.dumps(payload)

    channel.basic_publish(
        exchange="",
        routing_key="weather_queue",
        body=message,
        properties=pika.BasicProperties(delivery_mode=2)  # persistente
    )

    print(f"Mensagem publicada na fila! ({payload['fetched_at']})")

def main():
    connection, channel = connect_rabbit(RABBITMQ_URL)

    try:
        while True:
            try:
                weather = fetch_weather(LAT, LON)
                publish_weather(channel, weather)
            except Exception as e:
                print("Erro no coletor:", e)

            print(f"Aguardando {INTERVAL} minutos até próxima coleta...")
            time.sleep(INTERVAL * 60)

    finally:
        connection.close()

if __name__ == "__main__":
    main()
