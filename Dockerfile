FROM golang:alpine as builder
RUN apk update && apk upgrade && apk add --no-cache ca-certificates
RUN update-ca-certificates

FROM scratch
LABEL MAINTAINER Author maarten de kruijf, RabbITCybErSeC

ARG BINARY_NAME=soarca-gui
ARG VERSION

COPY bin/${BINARY_NAME}-${VERSION}-linux-amd64 /bin/soarca-gui
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

WORKDIR /bin

EXPOSE 8081

CMD ["./soarca-gui"]