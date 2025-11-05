import Form from "../Form/Form";

import { useState } from "react";

import '../Content/content.scss'

const Content = ({items, selectedFolderId, selectedSubFolderId, parentId, onRefreshed}) => {
    const [isShowForm, setIsShowForm] = useState(false)

    let content;
    
    try{
        if(items.length > 0 && selectedFolderId) {
            content = items.find(el => el.id === selectedFolderId)
        } else {
            if(items.length > 0 && selectedSubFolderId)
            content = (items.find(el => el.id === parentId)).items.find(el => el.id === selectedSubFolderId)
        }
    }catch(e) {
        
    }

    const trigerForm = () => {
        isShowForm ? setIsShowForm(false) : setIsShowForm(true)
    }

    return(
        <View content={content}
              isShowForm={isShowForm}
              trigerForm={trigerForm}
              parentId={parentId}
              selectedSubFolderId={selectedSubFolderId}
              onRefreshed={onRefreshed}/>
    )
}

const View = ({content, isShowForm, trigerForm, selectedSubFolderId, parentId, onRefreshed}) => {
    if(!content) return

    return(
        <div className="content">
            <h1>{content.content.title}</h1>
            {content.content.description ? <p>{content.content.description}</p> : 
            <button onClick={trigerForm}>Добавить описание</button>}
            {isShowForm ? <Form selectedSubFolderId={selectedSubFolderId} parentId={parentId} onRefreshed={onRefreshed} trigerForm={trigerForm}/> : null}
        </div>
    )
}

export default Content