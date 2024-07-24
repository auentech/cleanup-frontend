import { Card, Col, Grid, Title, Text, TextInput, Flex, Button, Callout, Divider } from "@tremor/react"
import { EnvelopeIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import isGuest from "@/common/middlewares/isGuest"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})
type LoginForm = z.infer<typeof LoginSchema>

const Login = () => {
    const router = useRouter()
    const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(LoginSchema),
    })

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: LoginForm) => signIn('credentials', {
            email, password,
            redirect: false
        })
    })

    const handleLoginSubmit: SubmitHandler<LoginForm> = data => loginMutation.mutate(data, {
        onSuccess: res => {
            if (res?.ok) {
                router.push('/redirector')
                return
            }

            if (res?.error?.includes("selected email is invalid")) {
                setError('email', { message: 'Account not found with this email' })
                return
            }

            setError('root.general', { message: res?.error! })
        },
    })

    return (
        <div className="p-12">
            <Grid numItemsSm={1} numItemsMd={12} numItemsLg={12}>
                <Col numColSpanMd={2} numColSpanLg={3}></Col>
                <Col numColSpanSm={1} numColSpanMd={8} numColSpanLg={6}>
                    {!!errors.root?.general.message && (
                        <Callout className="mb-6" color="red" title="Login error" icon={ExclamationTriangleIcon}>
                            {errors.root.general.message}
                        </Callout>
                    )}

                    <Card>
                        <Title>Login to dashboard</Title>
                        <Text>Access the dashboard for Cleanup. Designed and developed by Auen Technologies</Text>

                        <form onSubmit={handleSubmit(handleLoginSubmit)}>
                            <div className="mt-6">
                                <Text>Email</Text>
                                <TextInput
                                    errorMessage={errors.email?.message}
                                    error={!!errors.email?.message}
                                    {...register('email')}
                                    icon={EnvelopeIcon}
                                    className="mt-2"
                                    type="email"
                                />
                            </div>

                            <div className="mt-3">
                                <Text>Password</Text>
                                <TextInput
                                    errorMessage={errors.password?.message}
                                    error={!!errors.password?.message}
                                    {...register('password')}
                                    icon={LockClosedIcon}
                                    className="mt-2"
                                    type="password"
                                />
                            </div>

                            <Divider />

                            <Flex justifyContent="end" className="space-x-2 pt-4 mt-8">
                                <Button
                                    loading={loginMutation.isPending}
                                    loadingText="Logging you in..."
                                    type="submit"
                                    size="xs"
                                >Login to dashboard</Button>
                            </Flex>
                        </form>
                    </Card>
                </Col>
            </Grid>
        </div>
    )
}

export default isGuest(Login)
