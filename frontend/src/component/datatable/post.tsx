import { GridColDef, GridValueGetterParams, DataGrid, GridRowSpacingParams, GridPaginationModel } from '@mui/x-data-grid';
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { getPosts } from '../../redux/post';
import { Box, Grid, Stack, Typography } from '@mui/material';
import styled from '@emotion/styled';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import dayjs from 'dayjs';

const NiceMeta = styled.div`
    font-size: 0.7rem;
    background: grey;
    color: white;
    padding: 0px 0.4rem;
    border-radius: 5px;
`

const NiceContent = styled.div`
    text-align: left;
    padding: 20px 0px;
`

const MetaDisplay = (props: any) => {
    return <>
        <Stack flexDirection={'column'} justifyContent={'center'}>
            <Grid container spacing={1} alignItems={'center'}>
                <Grid item>
                    <Typography sx={{ display: 'block', minWidth: '30px' }} fontSize={'0.7rem'}>
                        <FacebookIcon sx={{ color: "#1565c0" }} />
                    </Typography>
                </Grid>
                <Grid item>
                    <NiceMeta>
                        {props.meta?.facebook?.likes || 0}
                    </NiceMeta>
                </Grid>
                <Grid item>
                    <NiceMeta>
                        {props.meta?.facebook?.shares || 0}
                    </NiceMeta>
                </Grid>
                <Grid item>
                    <NiceMeta>
                        {props.meta?.facebook?.comments || 0}
                    </NiceMeta>
                </Grid>
            </Grid>
            <Grid container spacing={1} alignItems={'center'}>
                <Grid item>
                    <Typography sx={{ display: 'block', minWidth: '30px' }} fontSize={'0.7rem'}>
                        <LinkedInIcon />
                    </Typography>
                </Grid>
                <Grid item>
                    <NiceMeta>
                        {props.meta?.linkedin?.likes || 0}
                    </NiceMeta>
                </Grid>
                <Grid item>
                    <NiceMeta>
                        {props.meta?.linkedin?.shares || 0}
                    </NiceMeta>
                </Grid>
                <Grid item>
                    <NiceMeta>
                        {props.meta?.linkedin?.comments || 0}
                    </NiceMeta>
                </Grid>
            </Grid>
        </Stack>
    </>
}

const PostTable = () => {
    const dispatch = useAppDispatch()
    const postStore = useAppSelector(state => state.post)

    const [pageModel, setPageModel] = React.useState({
        pageSize: 5,
        page: 0
    })

    const rowCount = postStore.totalCount

    const [rowCountState, setRowCountState] = React.useState(rowCount);

    useEffect(() => {
        dispatch(getPosts(pageModel.page, pageModel.pageSize))
    }, [])

    React.useEffect(() => {
        setRowCountState((prevRowCountState) =>
            rowCount !== undefined ? rowCount : prevRowCountState,
        );
    }, [rowCount, setRowCountState]);


    const columns: GridColDef[] = [
        {
            field: 'meta',
            headerName: 'Meta (Like/Share/Comment)',
            sortable: false,
            width: 200,
            renderCell: (params) => (
                <MetaDisplay meta={params.row.meta} />
            )
        },
        {
            field: 'user', headerName: 'Author', sortable: false,
            width: 100,
            valueGetter: (params: GridValueGetterParams) => {
                return `${params.row.user?.username}`
            }
        },
        {
            field: 'createdAt', headerName: 'Posted at', sortable: false,
            width: 150,
            valueGetter: (params: GridValueGetterParams) => {
                return `${dayjs(params.row.createdAt).format('DD/MM/YYYY HH:MM')}`
            }
        },
        {
            field: 'content',
            headerName: 'Content',
            flex: 4,
            sortable: false,
            align: 'left',
            renderCell: (params) => {
                return <NiceContent>
                    {params.row.content}
                </NiceContent>
            }
        },
    ];

    const getRowSpacing = React.useCallback((params: GridRowSpacingParams) => {
        return {
            top: 0,
            bottom: 0
        };
    }, []);

    const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
        // We have the cursor, we can allow the page transition.
        dispatch(getPosts(newPaginationModel.page + 1, newPaginationModel.pageSize))
        setPageModel(newPaginationModel);
    };

    return <>
        <div style={{ width: '100%' }}>
            <DataGrid
                autoHeight
                getRowSpacing={getRowSpacing}
                getRowHeight={() => 'auto'}
                getRowId={(row) => row._id}
                rows={postStore.posts}
                columns={columns}
                paginationModel={pageModel}
                rowCount={rowCountState}
                pageSizeOptions={[5, 10]}
                paginationMode="server"
                onPaginationModelChange={handlePaginationModelChange}
            />
        </div>
    </>
}

export default PostTable