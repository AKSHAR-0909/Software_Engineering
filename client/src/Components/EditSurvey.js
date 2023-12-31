import { useEffect, useRef, useState } from "react"
import { Snackbar } from "./Snackbar";
import { Form, Button } from "react-bootstrap";
import { Question } from "./Question";
import Axios from "../Misc/Axios";
import { getToken } from "../Misc/Tokens";

export const EditSurvey = () => {
    const [qs, setQs] = useState([{
        type: 2,
        question: "Answer this",
        options: ["Option-1", "Option-2"]
    }]);

    const [input, setInput] = useState('input');
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        console.log("input")

        if (input === 'input') {
            Axios.get('/list', {params: { user: getToken().user}})
            .then(res => {
                setSurveys(res.data.surveys)
            })
            .catch(e => {
                console.log(e)
            })
        }
        else if (input !== 'edit') {
            Axios.get('/survey', {params: {survey: input, user: getToken().user}})
            .then(res => {
                setQs(res.data.survey)
                setInput('edit')
            })
            .catch(e => {
                console.log(e)
            })
        }
    }, [input])

    const snackbarRef = useRef();
    const nameRef = useRef();

    const _showSnackbarHandler = (message) => {
        snackbarRef.current.openSnackBar(message)
    }

    const addQs = () => {
        if (qs.length >= 10) 
            snackbarRef.current.openSnackBar("Can't Add more questions")
        else 
            setQs([...qs, {
                type: 2,
                question: "Answer this",
                options: ["Option 1", "Option 2"]
            }]);
    }

    const removeQs = () => {
        if (qs.length <= 1) 
            snackbarRef.current.openSnackBar("Can't Remove more questions")
        else
            setQs(qs.slice(0, qs.length - 1));
    }

    const onChange = (i, state) => {
        let input = qs.slice()
        input[i] = state;
        setQs([...input])
    }

    const onSubmit = (e) => {
        e.preventDefault();
        let body = {
            user: getToken().user,
            questions: qs,
            name: nameRef.current.value
        }
        console.log("Questions", body)
        Axios.post('/create', body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
        }).then(res => {
            if (res?.data?.error === false) {
                _showSnackbarHandler("Form Created successfully")
            }
            else {
                _showSnackbarHandler(res.data.error)
            }
        }).catch(e => {
            if (e?.response?.data?.error !== undefined || e?.response?.data?.error !== null )
                _showSnackbarHandler(e?.response?.data?.error)
            else 
                _showSnackbarHandler(e.message)
        })
    }
    if (input === 'input') {
        return (
            <div className="text-centere">
                {surveys.map((v, i) => (
                    <>
                        <Button value={v} onClick={e => setInput(e.currentTarget.value)}>{v}</Button>
                        <br />
                    </>
                ))}
            </div>
        )
    }
    if (input === 'edit') {
    
        return (
            <div className="text-center">
                <Snackbar ref = {snackbarRef}  />
                <Form onSubmit={onSubmit}>
                    <input placeholder="SurveyName" ref={nameRef}></input>
                    {qs.map((v, i) => (
                        <Question key={i} name={i} state={v} onChange={onChange} />
                    ))}
                    <Button  onClick={addQs} > Add Question </Button> {' '} <Button variant="danger" onClick={removeQs}>Remove Question</Button>
                    <br />  
                    <Button type="submit" variant="success" >Create Survey</Button>
                </Form>
            </div>
        )
    } 
}