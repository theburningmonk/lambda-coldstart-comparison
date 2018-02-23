package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// Hello just returns Hello
func Hello() (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		Body:       "hello",
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(Hello)
}
