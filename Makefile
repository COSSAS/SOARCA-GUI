.PHONY: dev-server dev-tailwind dev-templ dev build-server build-tailwind build-templ build launch deploy

#-----------------------------------------------------
# DEV
#-----------------------------------------------------
templ:

dev:
	@make -j dev-templ dev-tailwind dev-server 

dev-server:
	# run air to detect any go file changes to re-build and re-run the server.

	@go run github.com/air-verse/air@latest \
	--build.cmd "templ generate && go build --tags dev -o tmp/bin/main ./server/" --build.bin "tmp/bin/main" --build.delay "100" \
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

build:
	@make build-tailwind build-server build-templ

build-server:
	@go build -o bin/server ./server/main.go

build-templ:
	@templ generate

build-tailwind:
	@npx tailwindcss -m -i ./views/assets/app.css -o ./public/public/styles.css $(ARGS)

.DEFAULT_GOAL := dev  