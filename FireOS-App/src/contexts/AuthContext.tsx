import React, {useState, createContext, ReactNode, useEffect} from 'react';
import {api} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

//1 - Tipagem do contexto
type AuthContextData = {
user: UserProps;
isAuthenticated: boolean;
signIn: (credentials: SignInProps) => Promise<void>;
loadingAuth: boolean;
loading: boolean;
signOut: () => Promise<void>
}

//2 - Tipagem do usuário
type UserProps = {
    id: string;
    name: string;
    email: string;
    token: string;
}

//3 - Tipagem do componente AuthProvider
type AuthProviderProps = {
    children: ReactNode;
}

type SignInProps = {
    email:string;
    password: string;
}

// 4 - Criação do contexto
export const AuthContext = createContext({} as AuthContextData)

//5 - Componente AuthProvider
export function AuthProvider({children}: AuthProviderProps){
    const [user, setUser] = useState<UserProps>({
        id: '',
        name: '',
        email: '',
        token: ''
    })

    const[loadingAuth, setLoadingAuth] = useState(false)
    const [loading, setLoading] = useState(true)

    const isAuthenticated = !!user.name;
    //Todo nosso projeto vai estar dentro do nosso contexto.]


    
    useEffect(() => {
        async function getUser() {
          // Pegar os dados salvos
          const userInfo = await AsyncStorage.getItem('@AlltiService');
      
          // Transformar em objeto denovo
          let hasUser: UserProps = JSON.parse(userInfo || '{}');
      
          // Verificar se recebemos as informações
          if (Object.keys(hasUser).length > 0) {
            api.defaults.headers.common['Authorization'] = `Bearer ${hasUser.token}`;
      
            // Passar as informações do usuário
            setUser({
              id: hasUser.id,
              name: hasUser.name,
              email: hasUser.email,
              token: hasUser.token,
            });
          }
          setLoading(false)
        }
      
        getUser();
      }, []);
    
    async function signIn({email, password}: SignInProps){
        setLoading(true);

        try{
            const response = await api.post('/session',{
                email,
                password
            })

            //console.log(response.data)
             const {id, name, token} = response.data;

             //Colocando nosso objeto dentro do nosso const objeto data.
             const data = {
                ...response.data
             }

             //Converter as informações de objeto para string JSON.stringify(data)

             await AsyncStorage.setItem('@AlltiService',JSON.stringify(data))

             //Todas as nossas requisições precisamos fornecer nosso Bearer Token:

             api.defaults.headers.common['Authorization'] = `Bearer ${token}`

             //Pegar as Informações do usuário e passar para o nosso useState:
             setUser({
                id,
                name,
                email,
                token,
             })
             //Desativa nosso setLoading
             setLoading(false)
             
        }catch(error: any){
            console.log('Erro ao acessar', error)
            setLoading(false)

            if (error.response) {
                console.log('Erro de resposta da API:', error.response.data);}
        }
    }

    //Limpar Local Storage, dados do setUser e sair do App
    async function signOut(){
      await AsyncStorage.clear()
      .then(() => {
      setUser({
      id: '',
      name: '',
      email: '',
      token: ''
    })
    })
    }

return(
    <AuthContext.Provider 
    value={{
    user, 
    isAuthenticated, 
    signIn, 
    loading, 
    loadingAuth, 
    signOut
    }}>
        {children}
    </AuthContext.Provider>
);

}