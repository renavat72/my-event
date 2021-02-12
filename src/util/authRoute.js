import React, {useContext} from 'react'
import {Route} from 'react-router-dom'

import {AuthContext} from '../context/auth'
import Authorization from '../components/Authorization'
import Dashboard from '../components/Dashboard'

function AuthRoute ({component: Component, ...rest}){
    const {user} = useContext(AuthContext)

    return(
        <Route
            {...rest}
            render={props =>
                localStorage.getItem('jwtToken')  ? <Route to="/" component={Dashboard}/> : <Route exact to="/authorization" component={Authorization}/>
            }
        />
    )
}

export default AuthRoute;