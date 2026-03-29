import * as React from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"

const Form = FormProvider
const FormField = Controller
const FormItem = React.forwardRef(({ className, ...props }: any, ref) => <div ref={ref} className={className} {...props} />)
FormItem.displayName = "FormItem"
const FormLabel = React.forwardRef(({ className, ...props }: any, ref) => <label ref={ref} className={className} {...props} />)
FormLabel.displayName = "FormLabel"
const FormControl = React.forwardRef(({ ...props }: any, ref) => <div ref={ref} {...props} />)
FormControl.displayName = "FormControl"
const FormMessage = React.forwardRef(({ className, children, ...props }: any, ref) => null)
FormMessage.displayName = "FormMessage"

export { Form, FormItem, FormLabel, FormControl, FormMessage, FormField }
