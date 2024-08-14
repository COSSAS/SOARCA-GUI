package utils

type Errors map[string]error

func (e Errors) Any() bool {
	return len(e) > 0
}

func (e Errors) Add(field string, msg error) {
	if _, ok := e[field]; !ok {
		e[field] = msg
	}
	e[field] = msg
}

func (e Errors) Get(field string) error {
	return e[field]
}

func (e Errors) Has(key string) bool {
	_, exists := e[key]
	return exists
}
