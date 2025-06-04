import React from 'react'
import { useQuery } from '@tanstack/react-query'
import clienteAxios from '../config/axios'

export const Ejemplo = () => {

    const getDash = async () => {
        const { data } = await clienteAxios.get('/dashboard/')
        console.log(data)
        return data
    }

    const { data, error, isLoading } = useQuery({
        queryKey: ["data"],
        queryFn: getDash,
    });

    // if (isLoading) {
    //     return (
    //         <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    //             <div className="text-center">
    //                 <Spinner
    //                     className="mx-auto"
    //                     style={{
    //                         width: '5rem',
    //                         height: '5rem',
    //                         borderWidth: '0.8rem',
    //                     }}
    //                     color="primary"
    //                 />
    //                 <p className="mt-3" style={{ fontSize: '1.2rem', color: '#333' }}>Cargando Información...</p>
    //             </div>
    //         </div>
    //     );
    // }

    if (error) return <p>Error: {
        <>
            <div class="alert alert-danger" role="alert">
                {error.response.data.detail}
            </div>
        </>

    }</p>;

    return (
        <>
            <h1>Hola</h1>
            {
                isLoading ? (
                    <p>cargando</p>
                ) : (
                    data?.resumen?.map(resumenElemento => (
                        <div>
                            <p>{resumenElemento.elemento}</p>
                            <p><span className='fw-bolder'>Recuperacion: </span>{resumenElemento.recuperacion}</p>
                        </div>
                    ))
                )
            }
        </>
    )
}
