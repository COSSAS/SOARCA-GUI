package utils

type Errors map[string][]string

func (e Errors) Any() bool {
	return len(e) > 0
}

func (e Errors) Add(field string, msg string) {
	if _, ok := e[field]; !ok {
		e[field] = []string{}
	}
	e[field] = append(e[field], msg)
}

func (e Errors) Get(field string) []string {
	return e[field]
}

func (e Errors) Has(field string) bool {
	return len(e[field]) > 0
}
