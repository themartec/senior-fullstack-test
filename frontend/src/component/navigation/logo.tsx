import { CampaignOutlined } from "@mui/icons-material";
import { Typography, Stack, Box } from "@mui/material";
import { css } from "@emotion/css";

const Logo = () => {
    return <>
        <Box sx={{
            minWidth: 180,
            color: 'white',
            background: 'black',
            outline: '1px solid white',
            padding: '10px',
            borderRadius: '30px 4px 30px'
        }}
            className={css`
                &:hover {
                    cursor: pointer;
                    box-shadow: 0 0 10px 0px black;
                }
            `}
        >
            <Stack direction={'row'} alignContent={'center'}>
                <CampaignOutlined />
                <Typography sx={{ marginLeft: 1 }}>
                    Themartec App
                </Typography>
            </Stack>
        </Box>
    </>
}

export default Logo;