import React, { useState,  useEffect } from 'react';
import { Table, Input, Popconfirm, Form, Modal, Button, Row, Col, InputNumber, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import img404 from './images/404.svg';
import {Link} from 'react-router-dom';
import * as firebase from 'firebase/app';

const FileInput = () => {

  return <input type='file' id='TableFileInput' />;
}

// editable cell
const EditableCell = ({
  editing,
  dataIndex,
  title,
  isImage,
  record,
  index,
  children,
  ...restProps
}) => {
  
  const inputNode = isImage ? <FileInput/> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true ? !record.isImage : false,
              message: `!برجاء ادخال القيمة`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export const ViewableImage = ({imageUrl}) => {

    const [visibility, setVisibility] = useState(false);
    const [imgUrl, setImgUrl] = useState(undefined);

    useEffect(() => {
      if(imageUrl) {
        firebase.storage().ref(imageUrl).getDownloadURL().then((url) => {
          setImgUrl(url);
        });
      }else {
        setImgUrl(null);
      }
    }, []);
  
    if(imgUrl === undefined) {
      return <Spin size='small'/>;
    }

    return (
      
      <a disabled={!imageUrl} onClick={() => {
        Modal.info({
          title: 'الصورة',
          content: (<img style={{maxWidth: 300, maxHeight: 300}} src={imgUrl} alt='#'/>)
        })
      }}>{imageUrl ? imgUrl.substr(0, 30): ''}...</a>
      
    );
}

export const EditableTable = ({originData, doctor}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        // record here
        let input = document.getElementById('TableFileInput');
        let file;
        if(input) {
          file = input.files[0];
        }
        item.onUpdate(item.fieldName, row, file);
        /////////
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
              <Popconfirm title="هل انت متأكد من تغيير تلك البيانات ؟" onConfirm={() => save(record.key)}>
            <a
              style={{
                marginLeft: 8
              }}

            >
              تعديل
            </a>
            </Popconfirm>
            
            <a onClick={cancel}> الغاء </a>
            
          </span>
        ) : (
          <a disabled={editingKey !== '' || record.disabled} onClick={() => edit(record)}>
            تعديل
          </a>
        );
      },
    },
    
    {
      title: 'القيمة',
      dataIndex: 'value',
      width: '60%',
      editable: true,
      render: (_, record) => {
        if(!record.isImage) {
          return record.value;
        }
        return <ViewableImage imageUrl={record.value}/>
      }
    },
    {
      title: 'العنصر',
      dataIndex: 'element',
      width: '25%',
      editable: false,
    }
    
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => {
        
        return {
        record,
        isImage: record.isImage,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }},
    };
  });
  
  return (
    <Form form={form}  component={false}>
      <Table

        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"

        scroll={{ x: 200 }}
        
      />
    </Form>
  );
};

export function reshaped(array, n) {

  let arr = [];
  for(let i=0;i<array.length;i++) {
      if(i%n === 0) {
          arr.push([array[i]]);
      }else {
          arr[Math.floor(i/n)].push(array[i]);
      }
  }

  return arr;
}

export const Loader = () => {

  return <div style={{width: '100%', height: '100%',
   display: 'flex',
    justifyContent: 'center', alignItems: 'center'}}>
      <Spin size='large' />
  </div>;
}

export const Page404 = () => {
  return (
    <div style={{width: "100%", height: "100vh", zIndex: 0}}>
      <div className="centered" style={{display: "flex",
       justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
        <img src={img404} alt="#" width="50%" height="50%"/>
        <h1>! Page not found</h1>
        <Link to="/">go back to start up page</Link>
      </div>
    </div>
  );
}

export const EditableField = ({children, onUpdate, number, initialValue}) => {
  const [isEditing, setEditingState] = useState(false);
  const [form] = Form.useForm();
  if(isEditing) {
    return (
      <Form form={form}>
        <Row gutter={[8, 8]}>

        <Col flex={number ? '' : 'auto'}>
            <Form.Item
            name='input'
            initialValue={initialValue}
            rules={[{
              required: true
            }]}
            >
              {number ? <InputNumber /> : <Input />}
            </Form.Item>
          </Col>
          <Col flex='40px'>
            <Button onClick={() => setEditingState(false)}>الغاء</Button>
          </Col>
          <Col flex='40px'>
            <Button htmlType='submit' onClick={async () => {
              if(!onUpdate) return;
              onUpdate((await form.validateFields()).input);
              setEditingState(false);
            }} className='green-btn'>تعديل</Button>
          </Col>
          
        </Row>
      </Form>
    );
  }

  return (
    <Row>
      <Col>
          {children}
      </Col>

      <Col flex='10px'>
        <a style={{color: 'grey', marginRight: 10, fontSize: 17}} onClick={() => setEditingState(true)}><EditOutlined/></a>
      </Col>
    </Row>
  );
}

export function timeStampToDate(timestamp) {

  return new Date(timestamp.seconds*1000);
}

export const usePagination = ({path, load_count, order, where})  => {
  const [objects, setObjects] = useState({lastVisible: null, data: [], finished: false, noObjects: false});
  const [progress, loadMore] = useState(0);

  useEffect(() => {
      let target = firebase.firestore().collection(path);
      let data;
      
      (async function() {
          if(order) {
              data = await target.orderBy('date', order).limit(load_count).get();
          }else {
              if(where) {
                let condition = where.split(' ');
                
                if(condition[0] === 'code') {
                  data = await target.doc(condition[2]).get();
                  
                  if(data.exists) {
                    data.docs = [data];
                  }else {
                    data.docs = [];
                  }
                }else {
                  condition[2] = condition.slice(2, condition.length).join(' ');
                  data = await target.where(condition[0], condition[1], condition[2]).limit(load_count).get();
                }
                
              }else {
                data = await target.limit(load_count).get();
              }
          }
          
          if(data.docs.length === 0) {
            
              setObjects({...objects, noObjects: true});
          }else {
            
              setObjects({
                  ...objects,
                  lastVisible: data.docs[data.docs.length - 1],
                  noObjects: false,
                  data: data.docs.map((doc) => {
                      return {...doc.data(), id: doc.id}
                  })
              });
          }
      })();

      return () => window.onscroll = null;
  }, [path, where]);

  useEffect(() => {
      if(progress) {
          
          let target = firebase.firestore().collection(path);
          (async function() {
              let data;
              if(order)  {
                  data = await target.orderBy('date', order).startAfter(progress).limit(load_count).get();
              }else {
                if(where) {
                  let condition = where.split(' ');
                  data = await target.where(condition[0], condition[1], condition[2]).startAfter(progress).limit(load_count).get();
                }else {
                  data = await target.startAfter(progress).limit(load_count).get();
                }
              }
          
              if(!data.docs[0]) {
                  
                  setObjects({...objects, finished: true});
              }else {
                  setObjects({
                      ...objects,
                      lastVisible: data.docs[data.docs.length - 1],
                      data: [...objects.data, ...data.docs.map((doc) => {
                          return {...doc.data(), id: doc.id}
                      })]
                      
                  });
              }
          })();
      }
  }, [progress]); 

  window.onscroll = !objects.finished ? function() {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
          if(objects.lastVisible) {
              loadMore(objects.lastVisible);
          }
      }
  } : null;

  return [objects, setObjects];
}
