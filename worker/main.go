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
	
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	apiURL := os.Getenv("BACKEND_URL") + "/api/weather/logs"

	var conn *amqp.Connection
	var err error
	for i := 0; i < 15; i++ {
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			log.Println("Conectado ao RabbitMQ!")
			break
		}
		log.Printf("Aguardando RabbitMQ... (%d/15)", i+1)
		time.Sleep(2 * time.Second)
	}
	failOnError(err, "Falha ao conectar no RabbitMQ após várias tentativas")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_queue", 
		true,            
		false,           
		false,           
		false,           
		nil,             
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, 
		"",     
		false,  
		false,  
		false,  
		false,  
		nil,    
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("Recebido da Fila: %s", d.Body)

			var weatherData WeatherLog
			
			err := json.Unmarshal(d.Body, &weatherData)
			if err != nil {
				log.Printf("Erro de JSON (ignorando mensagem): %v", err)
				d.Nack(false, false)
				continue
			}

			jsonData, _ := json.Marshal(weatherData)
			resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
			
			if err != nil {
				log.Printf("Erro de Rede ao contatar API: %v", err)
				d.Nack(false, true)
				time.Sleep(5 * time.Second)
				continue
			}
            defer resp.Body.Close()

			if resp.StatusCode == 201 {
				log.Printf("Sucesso! Enviado para API NestJS: %s", weatherData.City)
				d.Ack(false)
			} else {
				log.Printf("API recusou (Status %d). Devolvendo para fila.", resp.StatusCode)
				d.Nack(false, true)
			}
		}
	}()

	log.Printf(" [*] Worker Go rodando e aguardando mensagens...")
	<-forever
}