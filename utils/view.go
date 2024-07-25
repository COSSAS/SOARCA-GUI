package utils

import (
	"fmt"

	"github.com/a-h/templ"
)

func BaseAttributes(atrributeName string, class string, opts ...func(*templ.Attributes)) templ.Attributes {
	attrs := templ.Attributes{
		atrributeName: class + " ",
	}
	for _, o := range opts {
		o(&attrs)
	}
	return attrs
}

func CreateClassAttrs(baseClass string, opts ...func(*templ.Attributes)) templ.Attributes {
	return BaseAttributes("class", baseClass, opts...)
}

func Class(class string) func(*templ.Attributes) {
	return addToAttribute("class", class)
}

func Merge(a, b string) string {
	return fmt.Sprintf("%s %s", a, b)
}

func WithXdata(value string) func(*templ.Attributes) {
	return newAttribute("x-data", value)
}

func addToAttribute(atrributeName string, class string) func(*templ.Attributes) {
	return func(attrs *templ.Attributes) {
		attr := *attrs
		class := attr[atrributeName].(string) + " " + class
		attr[atrributeName] = class
	}
}

func newAttribute(key string, value string) func(*templ.Attributes) {
	return func(attrs *templ.Attributes) {
		attr := *attrs
		attr[key] = value
	}
}
