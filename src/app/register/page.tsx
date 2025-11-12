"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const schema = z.object({
  ownerName: z.string().min(1, "Owner name is required"),
  mobile: z
    .string()
    .regex(/^\d{10}$/g, "Mobile must be 10 digits"),
  email: z.string().email("Enter a valid email"),
  address: z.string().min(1, "Address is required"),
  name: z.string().min(1, "Restaurant name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerName: "",
      mobile: "",
      email: "",
      address: "",
      name: "",
      password: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.ownerName,
          email: values.email,
          phone: values.mobile,
          password: values.password,
          role: 'admin',
          restaurantName: values.name,
          address: values.address
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      toast({ title: "Registration successful", description: "You can now log in." })
      router.push("/")
    } catch (error: any) {
      console.error(error)
      toast({ title: "Registration failed", description: error?.message ?? "Something went wrong", variant: "destructive" as any })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)] items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">QRmenu</h1>
        <p className="text-lg text-gray-600">Welcome Back</p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register Restaurant</CardTitle>
          <CardDescription>Sign in to manage your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="9876543210" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant / Hotel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Awesome Bites" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Full address" className="min-h-24" autoComplete="street-address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Creating..." : "Create Account"}
              </Button>

              <div className="mt-2 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/" className="underline-offset-4 hover:underline">
                  Go to Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


