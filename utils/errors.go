package utils

type Errors map[string][]error

func (e Errors) Any() bool {
	return len(e) > 0
}

func (e Errors) Add(field string, msg error) {
	if _, ok := e[field]; !ok {
		e[field] = []error{}
	}
	e[field] = append(e[field], msg)
}

func (e Errors) Get(field string) []error {
	return e[field]
}

func (e Errors) Has(field string) bool {
	return len(e[field]) > 0
}
