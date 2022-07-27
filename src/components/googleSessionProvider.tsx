import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';

const GoogleLoginCredentialsContext = createContext<GoogleLoginCredentials | null>(null);
export const GoogleLoginCredentialsConsumer = GoogleLoginCredentialsContext.Consumer;
export function useGoogleLoginCredentials() {
    return useContext(GoogleLoginCredentialsContext);
}

export interface GoogleLoginCredentials {
    aud: string,
    azp: string,
    email: string,
    email_verified: boolean,
    exp: number,
    family_name: string,
    given_name: string,
    iat: number,
    iss: string,
    jti: string,
    name: string,
    nbf: number,
    picture: string,
    sub: string
}

const GoogleTokenContext = createContext<TokenResponse | null>(null);
export const GoogleTokenConsumer = GoogleTokenContext.Consumer;
export function useGoogleToken() {
    return useContext(GoogleTokenContext);
}

export interface GoogleApi {
    auth: typeof gapi.auth
    client: typeof gapi.client & { drive: any }
    load: typeof gapi.load
}

const GoogleApiContext = createContext<GoogleApi | null>(null);
export const GoogleApiConsumer = GoogleApiContext.Consumer;
export function useGoogleApi() {
    return useContext(GoogleApiContext);
}

export type GoogleSessionProviderProps = {
    requestAuth: boolean,
    loginCredentials: GoogleLoginCredentials | null,
    children: ReactNode
}
export function GoogleSessionProvider({ requestAuth, loginCredentials, children }: GoogleSessionProviderProps): JSX.Element {

    const [googleApi, setGoogleApi] = useState<GoogleApi | null>(null);
    useEffect(() => {
        return;
        //Client only
        if (typeof window === 'undefined') return;
        const scriptTag = document.createElement('script');
        scriptTag.src = 'https://apis.google.com/js/api.js';
        scriptTag.addEventListener('load', () => { 
            window.gapi.load('client', () => {
                window.gapi.client.init({
                    apiKey: 'PROPER KEY HERE',
                    scope: 'https://www.googleapis.com/auth/drive.file',
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
                }).then(() => {
                    setGoogleApi(window.gapi as GoogleApi);
                });
            });
        });
        document.body.appendChild(scriptTag);
    }, []);
    
    const [token, setToken] = useState<TokenResponse | null>(null);
    
    const googleLogin = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/drive.file',
        onSuccess: (token) => {
            setToken(token);
            //Refresh every 45 minutes
            setTimeout(() => googleLogin(), 45 * 60 * 1000);
        },
        flow: 'implicit',
        onError(errorResponse) {
            setToken(null);  
        },
        prompt: '',
    });

    useEffect(() => {
        if (!loginCredentials || !requestAuth) return;

        googleLogin({
            hint: loginCredentials.email,
        });

    }, [loginCredentials, googleLogin, requestAuth]);
    
    return <GoogleLoginCredentialsContext.Provider value={loginCredentials}>
        <GoogleTokenContext.Provider value={token}>
            <GoogleApiContext.Provider value={googleApi}>
                {children}
            </GoogleApiContext.Provider>
        </GoogleTokenContext.Provider>
    </GoogleLoginCredentialsContext.Provider>;
}
