package main

import (
	"fmt"
	"soarca-gui/internal/status"
	"soarca-gui/routes"
	"soarca-gui/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	Version   string = "dev"
	Buildtime string = ""
)

// @title           SOARCA-GUI
// @version         0.0.1
func main() {
	fmt.Println("Version: ", Version)
	fmt.Println("Buildtime ", Buildtime)
	// errenv := godotenv.Load(".env")

	errenv := godotenv.Load(".env.example")
	if errenv != nil {
		fmt.Println("Failed to read env variable, but will continue")
	}
	status.SetVersion(Version)

	app := gin.Default()
	routes.Setup(app)

	listeningPort := utils.GetEnv("PORT", "8081")
	url := fmt.Sprintf(":%s", listeningPort)
	fmt.Printf("application running in %s at %s\n", listeningPort, url)
	err := app.Run(url)
	if err != nil {
		fmt.Println("failed to start server")
	}
	fmt.Println("exit")
}
