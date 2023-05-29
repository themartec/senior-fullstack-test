import { Typography, Link, Stack } from "@mui/material"

const Copyright = () => {
    return
    <>
        <Stack justifyContent={"center"} sx={{ mt: 4 }}>
            <Typography variant="body2" align="center" sx={{ mt: 4 }}>
                {'Copyright © '}
                <Link color="inherit" href="https://mui.com/">
                    Myself
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        </Stack>
    </>
}

