import { NextPage } from 'next';
import { Box, Button, Paper, Select, Text, Title } from '@mantine/core'
import { useDataSource } from '~/services';
import { useCallback, useEffect, useState } from 'react';
import { EntityMetadata } from 'typeorm';
import { SqlTable } from '~/components/sqlTable'
import { TbDownload, TbUpload } from 'react-icons/tb';

export const DataPage: NextPage = () => {
    const [entityMetadata, setEntityMetadata] = useState<EntityMetadata[]>([]);
    const [selectedMetadata, setSelectedMetadata] = useState<EntityMetadata | undefined>(undefined);
    const [changesPending, setChangesPending] = useState<boolean>(false);

    const ds = useDataSource();

    const changesPendingCallback = useCallback((changesPending: boolean) => {
        setChangesPending(changesPending);
    }, [])

    useEffect(() => {
        if (!ds) return;

        setEntityMetadata(ds.entityMetadatas.filter(e => e.synchronize));
        setSelectedMetadata(ds.entityMetadatas[0]);
    }, [ds]);

    return <>
        <Box mr='auto' mb='md'>
            <Button leftIcon={<TbUpload size={20}/>} disabled={true}>
                Import Data
            </Button>
            <Button ml='md' leftIcon={<TbDownload size={20}/>} disabled={true}>
                Export Data
            </Button>
        </Box>
        <Select
            data={entityMetadata.map(e => e.name)}
            value={selectedMetadata?.name}
            onChange={(value) => setSelectedMetadata(entityMetadata.find(e => e.name === value))}
            sx={{
                maxWidth: '15em'
            }}
            disabled={changesPending}
        />
        <Paper sx={{
            overflowX: 'clip',
            maxWidth: '100%'
        }}>
            {
                (!selectedMetadata || !ds) ? <Text>Loading...</Text> : (
                    <Box pt='lg'>
                        <Title order={6}>{selectedMetadata.name}</Title>
                        <SqlTable
                            entityMetadata={selectedMetadata}
                            dataSource={ds}
                            changesPendingCallback={changesPendingCallback}
                        />   
                    </Box>
                )
            }
        </Paper>
    </>
}

export default DataPage;