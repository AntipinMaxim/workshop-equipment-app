// json-server --watch db.json --port 3000
import { v4 as uuidv4 } from 'uuid';

import Content from './components/Content/Content';

import { useEffect, useState, useRef } from 'react';

import './App.scss';

function App() {
  const [items, setItems] = useState([])

  const [folderName, setFolderName] = useState('')
  const [isFolderName, setIsFolderName] = useState(false)
  const [parentId, setParentId] = useState(null)
  const [subFolderName, setSubFolderName] = useState('')
  const [isSubFolderName, setIsSubFolderName] = useState(false)
  const folderInputRef = useRef(null)
  const subFolderInputRef = useRef(null)
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/items')
      .then(res => res.json())
      .then(items => {
        setItems(items)
      })
    }, [])
    
  useEffect(() => {
    if(folderInputRef.current) {
      folderInputRef.current.focus()
    }
  }, [isFolderName])

  useEffect(() => {
    if(subFolderInputRef.current) {
      subFolderInputRef.current.focus()
    }
  }, [isSubFolderName])

  const addFolder = async () => {
    setIsFolderName(true)
    
    const name = folderName.trim()
    if(!name || name === '') return

    const res = await fetch('http://localhost:3000/items',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          type: 'folder',
          items: [],
          content: {
            title: name
          }
        })
      }
    )
    const refreshed = await fetch('http://localhost:3000/items')
      .then(res => res.json())
    setItems(refreshed);

    setSelectedFolderId(null)
    setSelectedSubFolderId(null)
  }

  const showSubInput = () => {
    if(parentId) {
      setParentId(parentId)
      setIsSubFolderName(true)
    }
  }

  const addSubFolder = async (id) => {
    const newId = uuidv4()

    const name = subFolderName.trim()
    if(!name || name === '') return

    const parentRes = await fetch(`http://localhost:3000/items/${id}`)
    const parent = await parentRes.json()
    const patchRes = await fetch(`http://localhost:3000/items/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...parent,
          items: [
            ...parent.items,
            {
              id: newId,
              name: name,
              type: 'subFolder',
              content: {
                title: name
              }
            }
          ]
        })
      }
    )
    
    const refreshed = await fetch('http://localhost:3000/items')
      .then(res => res.json())
    setItems(refreshed);

    setSelectedFolderId(null)
    setSelectedSubFolderId(null)
  }

  const onFolderBlur = () => {
    addFolder();
    setIsFolderName(false)
    setFolderName('')
    setParentId(null)
  };

  const onFolderKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFolder();
      setIsFolderName(false)
      setFolderName('')
      setParentId(null)
    }
  };

   const onSubFolderBlur = (id) => {
    addSubFolder(id);
    setIsSubFolderName(false)
    setSubFolderName('')
    setParentId(null)
  };

  const onSubFolderKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubFolder(id);
      setIsSubFolderName(false)
      setSubFolderName('')
      setParentId(null)
    }
  };

  const onSelectedFolder = (idParent, i) => {
    if(idParent) {
      setSelectedFolderId(idParent)
      setParentId(idParent)
      setSelectedSubFolderId(null)
    }
  }

  const onSelectedSubFolder = (id, idParent) => {
    setSelectedSubFolderId(id)
    setParentId(idParent)
    setSelectedFolderId(null)
  }

  const removeFolder = async () => {
    if(!parentId) return

    const res = await fetch(`http://localhost:3000/items/${parentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const refreshed = await fetch('http://localhost:3000/items')
      .then(res => res.json())
    setItems(refreshed);
  }

  const onRefreshed = (arr) => {
    setItems(arr);
  }

  return (
    <div className="app">
      <header>Заголовок</header>
      <div className="wrapper">
        <nav>
          <span>Навигация</span>
          <button onClick={addFolder}>+</button>
          <button onClick={() => showSubInput()}>++</button>
          <button onClick={() => removeFolder()}>-</button>
          {isFolderName ?
           <input type="text"
                  ref={folderInputRef}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onBlur={onFolderBlur}
                  onKeyDown={onFolderKeyDown}
                  placeholder="Название папки" /> : null}
          {items.map((item, i) => {
            return (
              <li key={i}>
                <span onClick={() => onSelectedFolder(item.id, i)}
                      className= {selectedFolderId === item.id ? 'selected' : ''}>
                        {item.name}
                </span>
                {isSubFolderName && parentId === item.id ?
                <input type="text"
                        ref={subFolderInputRef}
                        value={subFolderName}
                        onChange={(e) => setSubFolderName(e.target.value)}
                        onBlur={() => onSubFolderBlur(item.id)}
                        onKeyDown={(e) => onSubFolderKeyDown(e, item.id)}
                        placeholder="Название папки" /> : null}
                  <ul>
                    {item.items.map((subItem, id) => <li key={id}>
                      <span onClick={() => onSelectedSubFolder(subItem.id, item.id)}
                            className= {selectedSubFolderId === subItem.id ? 'selected' : ''}>
                        {subItem.name}
                      </span></li>)}
                  </ul>
              </li>
            )
          })}
        </nav>
        <Content items={items} 
                 selectedFolderId={selectedFolderId} 
                 selectedSubFolderId={selectedSubFolderId}
                 parentId={parentId}
                 onRefreshed={onRefreshed}/>
      </div>
    </div>
  );
}

export default App;
