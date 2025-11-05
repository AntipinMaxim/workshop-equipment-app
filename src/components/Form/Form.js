import { useState } from 'react'

import '../Form/form.scss'

const Form = ({selectedSubFolderId, parentId, onRefreshed, trigerForm}) => {
    
    const postForm = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target);
        const parentRes = await fetch(`http://localhost:3000/items/${parentId}`)
        const parent = await parentRes.json()
        const newSubFolder = parent.items.map(item => {
            if(item.id === selectedSubFolderId) {
                const newItem = {...item, content: {...item.content, ...Object.fromEntries(formData.entries())}}
                return newItem
            } else {
                return item
            }
        })
        
        const patchRes = await fetch(`http://localhost:3000/items/${parentId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...parent,
                items: [
                    ...newSubFolder
                ]
            })
        })

        const refreshed = await fetch(`http://localhost:3000/items`)
            .then(res => res.json())
        onRefreshed(refreshed)
        trigerForm()
    }
    
    return (
        <form onSubmit={postForm}>
            <textarea name="description"></textarea>
            <button type='submit'>Сохранить</button>
        </form>
    )
}

export default Form