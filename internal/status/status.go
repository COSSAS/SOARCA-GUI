package status

import (
	"runtime"
	"soarca-gui/pkg/models/status"
	"soarca-gui/pkg/utils"
	"time"
)

var internalStatus = status.Status{Uptime: status.Uptime{Since: time.Now(), Milliseconds: 0},
	Mode:    utils.GetEnv("LOG_MODE", "production"),
	Runtime: runtime.GOOS}

func SetVersion(version string) {
	internalStatus.Version = version
}

func GetVersion() string {
	return internalStatus.Version
}
