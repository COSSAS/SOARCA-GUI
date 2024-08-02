package cacao

type Variable struct {
	Type        string `bson:"type" json:"type" validate:"required" example:"string"`                    // Type of the variable should be OASIS  variable-type-ov
	Name        string `bson:"name,omitempty" json:"name,omitempty" example:"__example_string__"`        // The name of the variable in the style __variable_name__
	Description string `bson:"description,omitempty" json:"description,omitempty" example:"some string"` // A description of the variable
	Value       string `bson:"value,omitempty" json:"value,omitempty" example:"this is a value"`         // The value of the that the variable will evaluate to
	Constant    bool   `bson:"constant,omitempty" json:"constant,omitempty" example:"false"`             // Indicate if it's a constant
	External    bool   `bson:"external,omitempty" json:"external,omitempty" example:"false"`             // Indicate if it's external
}
