import { Grid, Button, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch, RootState } from "../../redux/store";
import { loginFacebook } from '../../redux/auth'
import { useSelector } from "react-redux";
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const LoginSocial = () => {
    const dispatch = useAppDispatch()
    const auth = useSelector((state: RootState) => state.auth)

    const loginFacebookHandle = (event: React.MouseEvent<HTMLElement>) => {
        FB.login((loginResponse) => {
            //get the access token and save it to the state
            FB.api('/me', function (response: any) {
                dispatch(loginFacebook(response, loginResponse.authResponse))
            });
        }, {
            config_id: process.env.REACT_APP_LOGIN_CONFIGURATION_ID,
            response_type: 'code'
        } as any)
    }

    const loginLinkedinHandle = (event: React.MouseEvent<HTMLElement>) => {
        //redirect to linkedin login page
        let redirect_url = 'https://www.linkedin.com/oauth/v2/authorization?'
        redirect_url += 'response_type=code&'
        redirect_url += `client_id=${process.env.REACT_APP_LINKEDIN_CLIENT_ID}&`
        redirect_url += `redirect_uri=${process.env.REACT_APP_LINKEDIN_REDIRECT_URI}&`
        redirect_url += `state=${auth.user.id}&`
        redirect_url += encodeURI('scope=r_liteprofile r_emailaddress w_member_social')

        window.location.href = redirect_url
    }

    return <>
        <Grid container
            justifyContent={
                {
                    xs: 'center',
                    sm: 'flex-end'
                }
            }
            rowSpacing={{
                xs: 1,
                sm: 0
            }}
            columnSpacing={{
                xs: 1,
            }}
        >
            <Grid item>
                <Button variant="contained" startIcon={<FacebookIcon />} sx={{ backgroundColor: '#0362c0' }} onClick={loginFacebookHandle}>
                    {
                        auth?.user?.meta?.facebook?.name &&
                        <Typography>
                            {auth?.user?.meta?.facebook?.name || ''}
                        </Typography>
                    }
                    {
                        !auth?.user?.meta?.facebook?.name &&
                        <Typography>
                            Link Facebook
                        </Typography>
                    }
                </Button>
            </Grid>
            <Grid item>
                <Button variant="contained" startIcon={<LinkedInIcon />} sx={{ backgroundColor: '#0362c0' }} onClick={loginLinkedinHandle}>
                    {
                        auth?.user?.meta?.linkedin?.name &&
                        <Typography>
                            {auth?.user?.meta?.linkedin?.name || ''}
                        </Typography>
                    }
                    {
                        !auth?.user?.meta?.linkedin?.name &&
                        <Typography>
                            Link Linkedin
                        </Typography>
                    }
                </Button>
            </Grid>


        </Grid>
    </>
}

export default LoginSocial