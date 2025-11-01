// json-server --watch db.json --port 3000

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
          items: []
        })
      }
    )
    const refreshed = await fetch('http://localhost:3000/items')
      .then(res => res.json())
    setItems(refreshed);
      
     
  }

  const showSubInput = (parentId) => {
    setParentId(parentId)
    setIsSubFolderName(true)
  }

  const addSubFolder = async (id) => {
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
              id: parent.items.length + 1,
              name: name,
              type: 'subFolder',
            }
          ]
        })
      }
    )
    
    const refreshed = await fetch('http://localhost:3000/items')
      .then(res => res.json())
    setItems(refreshed);
  }

  const onFolderBlur = () => {
    addFolder();
    setIsFolderName(false)
    setFolderName('')
  };

  const onFolderKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFolder();
      setIsFolderName(false)
      setFolderName('')
    }
  };

   const onSubFolderBlur = (id) => {
    addSubFolder(id);
    setIsSubFolderName(false)
    setSubFolderName('')
  };

  const onSubFolderKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubFolder(id);
      setIsSubFolderName(false)
      setSubFolderName('')
    }
  };

  return (
    <div className="app">
      <header>Заголовок</header>
      <div className="wrapper">
        <nav>
          <span>Навигация</span>
          <button onClick={addFolder}>+</button>
          {isFolderName ?
           <input type="text"
                  ref={folderInputRef}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onBlur={onFolderBlur}
                  onKeyDown={onFolderKeyDown}
                  placeholder="Название папки" /> : null}
          {items.map((item, id) => {
            return (
              <li key={id}>
                {item.name}
                <button onClick={() => showSubInput(item.id)}>+</button>
                {isSubFolderName && parentId === item.id ?
                <input type="text"
                        ref={subFolderInputRef}
                        value={subFolderName}
                        onChange={(e) => setSubFolderName(e.target.value)}
                        onBlur={() => onSubFolderBlur(item.id)}
                        onKeyDown={(e) => onSubFolderKeyDown(e, item.id)}
                        placeholder="Название папки" /> : null}
                  <ul>
                    {item.items.map((item, id) => <li key={id}>{item.name}</li>)}
                  </ul>
              </li>
            )
          })}
        </nav>
        <div className="content">Контент</div>
      </div>
    </div>
  );
}

export default App;
