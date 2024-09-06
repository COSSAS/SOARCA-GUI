.PHONY: dev-server dev-tailwind dev-templ dev build-server build-tailwind build-templ build launch deploy clean test


BINARY_NAME = soarca-gui
DIRECTORY = $(sort $(dir $(wildcard ./test/*/)))
VERSION = $(shell git describe --tags --dirty)
BUILDTIME := $(shell  date '+%Y-%m-%dT%T%z')

GOLDFLAGS += -X main.Version=$(VERSION)
GOLDFLAGS += -X main.Buildtime=$(BUILDTIME)
GOFLAGS = -ldflags "$(GOLDFLAGS)"

#-----------------------------------------------------
# DEV
#-----------------------------------------------------

dev:
	@make -j dev-templ dev-tailwind dev-server 

dev-server:
	# run air to detect any go file changes to re-build and re-run the server.

	@go run github.com/air-verse/air@latest \
	--build.cmd "templ generate && go build -ldflags \"-X main.Version=$(VERSION)\"  --tags dev -o tmp/bin/main ./server/" --build.bin "tmp/bin/main" --build.delay "100" \
	--build.exclude_dir "node_modules" \
	--build.exclude_regex ".*_templ.go" \
	--build.include_ext "go,templ" \
	--build.stop_on_error "false" \
	--build.exclude_regex ".*_templ.go" \
	--build.poll "true" \
	--misc.clean_on_exit true


# watch for any js or css change in the assets/ folder, then reload the browser via templ proxy.
sync_assets:
	go run github.com/air-verse/air@latest \
	--build.cmd "go run github.com/a-h/templ/cmd/templ@latest generate --notify-proxy" \
	--build.bin "true" \
	--build.delay "100" \
	--build.exclude_dir "" \
	--build.include_dir "public" \
	--build.include_ext "js,css"


dev-templ:
	@go run github.com/a-h/templ/cmd/templ@latest generate --watch --proxy="http://localhost:8081" --open-browser=false -v

dev-tailwind:
	@make ARGS="--watch" build-tailwind


#-----------------------------------------------------
# BUILD
#-----------------------------------------------------

build:  build-templ build-tailwind build-server

build-server:
	echo "Compiling for every OS and Platform"
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o bin/${BINARY_NAME}-${VERSION}-linux-amd64 $(GOFLAGS) ./server/main.go
	CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o bin/${BINARY_NAME}-${VERSION}-darwin-arm64 $(GOFLAGS) ./server/main.go
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o bin/${BINARY_NAME}-${VERSION}-windows-amd64 $(GOFLAGS) ./server/main.go


docker: 
	docker build --no-cache -t soarca-gui:${VERSION} --build-arg="VERSION=${VERSION}" .

build-templ:
	@templ generate

build-tailwind:
	@npx tailwindcss -m -i ./views/assets/app.css -o ./public/public/styles.css $(ARGS)

lint: build-templ
	GOFLAGS=-buildvcs=false golangci-lint run --timeout 5m0s -v

clean:
	rm -rf build/soarca* build/main
	rm -rf bin/*
	find . -type f -name "*_templ.go" -delete
	
run: docker
	GIT_VERSION=${VERSION} docker compose up --build --force-recreate -d

test: build-templ
	go test ./... -v

.DEFAULT_GOAL := dev  