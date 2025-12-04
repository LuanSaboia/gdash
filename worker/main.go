package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Essa estrutura TEM que bater com o que o Python envia e o NestJS espera
type WeatherLog struct {
	City        string  `json:"city"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"windSpeed"`
	Condition   string  `json:"condition"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	// Pega URLs das variáveis de ambiente do Docker
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	apiURL := os.Getenv("BACKEND_URL") + "/api/weather/logs"

	// Retry de conexão com o RabbitMQ (espera ele subir)
	var conn *amqp.Connection
	var err error
	for i := 0; i < 15; i++ { // Tenta por 30 segundos
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			log.Println("✅ Conectado ao RabbitMQ!")
			break
		}
		log.Printf("⏳ Aguardando RabbitMQ... (%d/15)", i+1)
		time.Sleep(2 * time.Second)
	}
	failOnError(err, "Falha ao conectar no RabbitMQ após várias tentativas")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	// Garante que a fila existe (Idempotente)
	q, err := ch.QueueDeclare(
		"weather_queue", // nome
		true,            // durable
		false,           // delete when unused
		false,           // exclusive
		false,           // no-wait
		nil,             // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (vamos dar ack manual)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("📥 Recebido da Fila: %s", d.Body)

			var weatherData WeatherLog
			// Tenta transformar o JSON da mensagem na struct do Go
			err := json.Unmarshal(d.Body, &weatherData)
			if err != nil {
				log.Printf("❌ Erro de JSON (ignorando mensagem): %v", err)
				d.Nack(false, false) // Rejeita e descarta (não requeue)
				continue
			}

			// Prepara para enviar ao NestJS
			jsonData, _ := json.Marshal(weatherData)
			resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
			
			if err != nil {
				log.Printf("⚠️ Erro de Rede ao contatar API: %v", err)
				d.Nack(false, true) // Devolve para a fila tentar depois
				time.Sleep(5 * time.Second) // Espera um pouco antes de pegar de novo
				continue
			}
            defer resp.Body.Close()

			if resp.StatusCode == 201 {
				log.Printf("🚀 Sucesso! Enviado para API NestJS: %s", weatherData.City)
				d.Ack(false) // Confirma sucesso para a fila
			} else {
				log.Printf("⚠️ API recusou (Status %d). Devolvendo para fila.", resp.StatusCode)
				d.Nack(false, true) // Devolve para fila
			}
		}
	}()

	log.Printf(" [*] Worker Go rodando e aguardando mensagens...")
	<-forever
}