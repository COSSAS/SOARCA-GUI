#!/usr/bin/bash
set -euxo pipefail

# Install go
wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz

# Export paths to ~/.bashrc
# echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
# echo 'export GOROOT=/usr/local/go' >> ~/.bashrc
# echo 'export PATH=$PATH:$GOROOT/bin' >> ~/.bashrc
# echo 'export GOPATH=$HOME/go' >> ~/.bashrc
# echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc

export PATH=$PATH:/usr/local/go/bin 
export GOROOT=/usr/local/go
export PATH=$PATH:$GOROOT/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# Install nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 18

# Install dependencies for project
go install github.com/a-h/templ/cmd/templ@v0.2.771
npm install