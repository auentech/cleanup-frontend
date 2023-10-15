import { Card, Col, Grid, Title, Text, TextInput, Flex, Button, Callout, Divider } from "@tremor/react"
import { EnvelopeIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import isGuest from "@/common/middlewares/isGuest"

const Login = () => {
    const router = useRouter()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const [emailError, setEmailError] = useState<string>('')
    const [generalError, setGeneralError] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)

    const resetErrors = () => {
        setEmailError('')
        setGeneralError('')
        setPasswordError('')
    }

    const handleLogin = async () => {
        setLoading(true)
        resetErrors()

        if (!isEmail(email)) {
            setEmailError('Please enter a valid email')
            setLoading(false)

            return
        }

        if (!isStrongPassword(password, { minSymbols: 0 })) {
            setPasswordError('Please enter a proper password')
            setLoading(false)

            return
        }

        const response = await signIn('credentials', {
            email, password,
            redirect: false
        })

        if (response?.ok) {
            setLoading(false)
            router.push('/redirector')

            return
        }

        setGeneralError(response?.error as string)
        setLoading(false)
    }

    return (
        <div className="p-12">
            <Grid numItemsSm={1} numItemsMd={12} numItemsLg={12}>
                <Col numColSpanMd={2} numColSpanLg={3}></Col>
                <Col numColSpanSm={1} numColSpanMd={8} numColSpanLg={6}>
                    {generalError != '' && (
                        <Callout className="mb-6" color="red" title="Login error" icon={ExclamationTriangleIcon}>
                            {generalError}
                        </Callout>
                    )}

                    <Card>
                        <Title>Login to dashboard</Title>
                        <Text>Access the dashboard for Cleanup. Designed and developed by Auen Technologies</Text>

                        <div className="mt-6">
                            <Text>Email</Text>
                            <TextInput
                                onInput={e => setEmail(e.currentTarget.value)}
                                icon={EnvelopeIcon}
                                placeholder=""
                                type="email"
                                className="mt-2"
                                error={emailError != ''}
                                errorMessage={emailError} />
                        </div>

                        <div className="mt-3">
                            <Text>Password</Text>
                            <TextInput
                                onInput={e => setPassword(e.currentTarget.value)}
                                icon={LockClosedIcon}
                                type="password"
                                placeholder=""
                                className="mt-2"
                                error={passwordError != ''}
                                errorMessage={passwordError} />
                        </div>

                        <Divider />

                        <Flex justifyContent="end" className="space-x-2 pt-4 mt-8">
                            <Button
                                size="xs"
                                loadingText="Logging you in..."
                                onClick={handleLogin}
                                loading={loading}
                            >Login to dashboard</Button>
                        </Flex>
                    </Card>
                </Col>
            </Grid>
        </div>
    )
}

export default isGuest(Login)
