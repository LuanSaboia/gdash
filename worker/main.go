package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/streadway/amqp"
)

type WeatherMessage struct {
	FetchedAt string      `json:"fetched_at"`
	Latitude  string      `json:"latitude"`
	Longitude string      `json:"longitude"`
	Current   interface{} `json:"current_weather"`
	Hourly    interface{} `json:"hourly"`
}

func main() {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	backendURL := os.Getenv("BACKEND_URL")

	if backendURL == "" {
		backendURL = "http://backend:3000"
	}

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("Erro ao conectar no RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	msgs, err := ch.Consume(
		"weather_queue",
		"",
		false, // ack manual
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao consumir: %v", err)
	}

	log.Println("Worker aguardando mensagens...")

	for msg := range msgs {

		var payload WeatherMessage
		err := json.Unmarshal(msg.Body, &payload)
		if err != nil {
			log.Println("Falha ao decodificar JSON:", err)
			msg.Nack(false, true)
			continue
		}

		log.Println("Mensagem recebida:", payload.FetchedAt)

		// Envia ao backend (weather logs)
		err = sendToBackend(backendURL, payload)
		if err != nil {
			log.Println("Erro ao enviar ao backend:", err)
			msg.Nack(false, true)
			continue
		}

		// Envia insight automático
		if err := sendInsightToBackend(backendURL, payload); err != nil {
			log.Println("Erro ao enviar insight automático:", err)
		}

		// OK → confirmar
		msg.Ack(false)
	}
}

/*=============================================
=          ENVIO DO DADO AO BACKEND           =
=============================================*/

func sendToBackend(base string, data WeatherMessage) error {
	jsonData, _ := json.Marshal(data)
	url := base + "/api/weather"

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode >= 300 {
		return fmt.Errorf("backend retornou código %d: %s", resp.StatusCode, string(body))
	}

	log.Println("Enviado ao backend com sucesso!")
	return nil
}

/*=============================================
=     ENVIO DE INSIGHT AUTOMÁTICO (NOVO)     =
=============================================*/

func sendInsightToBackend(base string, weather WeatherMessage) error {
	body := map[string]interface{}{
		"weather": weather,
		"summary": fmt.Sprintf(
			"Insight automático: temperatura atual %.1f°C.",
			extractTemperature(weather),
		),
		"generated_by_ai": false,
	}

	jsonData, _ := json.Marshal(body)
	url := base + "/api/insights"

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	responseBody, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode >= 300 {
		return fmt.Errorf("erro ao enviar insight: %s", string(responseBody))
	}

	log.Println("Insight automático enviado com sucesso!")
	return nil
}

/*=============================================
=       AUXILIAR: EXTRAI TEMPERATURA         =
=============================================*/

func extractTemperature(w WeatherMessage) float64 {
	// current_weather vem como interface{}, precisamos converter
	current, ok := w.Current.(map[string]interface{})
	if !ok {
		return 0.0
	}

	// pega campo temperature, sempre float64
	if temp, ok := current["temperature"].(float64); ok {
		return temp
	}

	return 0.0
}
