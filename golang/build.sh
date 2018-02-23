GOOS=linux GOARCH=amd64 go build -o bin/handler handler.go
cd bin
zip deploy-package.zip handler