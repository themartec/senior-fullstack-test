import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Modal, Box, Typography, Button, TextField, Stack } from "@mui/material";
import { useAppDispatch } from "../../redux/store";
import { newPost } from "../../redux/post";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default NiceModal.create(({ }) => {
    const modal = useModal();
    const dispatch = useAppDispatch()

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const parsed = Object.fromEntries(data)

        const content: string = data.get('content') as string

        dispatch(newPost(content, modal.hide))
    }

    return <>
        <Modal
            open={modal.visible}
            onClose={modal.hide}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Content to post on social
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        rows={4}
                        multiline
                        id="content"
                        label="content"
                        name="content"
                        autoComplete="content"
                        autoFocus
                    />
                    <Stack sx={{ mt: 1 }} direction="row" spacing={2} alignItems={'center'} justifyContent={'space-between'}>
                        <Button
                            type="submit"
                            variant="contained"
                            endIcon={<CheckCircleIcon />}
                        >
                            Post now
                        </Button>
                        <Button variant="outlined" onClick={modal.hide}>
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Modal>
    </>
})