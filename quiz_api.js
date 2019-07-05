'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const quiz = require('./quiz');

// load environment variables
require('dotenv').config();

// express
const app = new express();
const port = 3000;

//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static & LIFF files
app.use('/static', express.static('static'));
app.use('/liff', express.static('liff'));

// root
app.get('/', (req, res) => {
    console.log('Root Accessed!');
    // Let's QUIZ!
    const user_id = 'hoge'
    console.log('Preared questions: ' + JSON.stringify(quiz.initializeQuizFor(user_id)));
    console.log('User Data: ' + JSON.stringify(quiz.getUserDataFor(user_id)));
    for (let i = 0; i < 5; i++) {
        let q = quiz.getCurrentQuestionFor(user_id);
        console.log('Current question: ' + JSON.stringify(q));
        console.log('Answer: ' + JSON.stringify(quiz.answerQuestionFor(user_id, q.id, 1)));
    }
    console.log('Result: ' + JSON.stringify(quiz.getQuizeResultFor(user_id)));
    // return response
    res.send('This is a LINE Bot hands-on quiz app! Version: ' + quiz.version());
});

// Quiz APIs
// クイズ初期化API [POST only]
app.post('/api/initializeQuiz', (req, res) => {
    console.log('API initializeQuiz function called!');
    console.log(req.body);
    const user_id = req.body.user_id;
    const user_data = quiz.initializeQuizFor(user_id);
    const q = quiz.getCurrentQuestionFor(user_id);
    res.json({
        user_id: user_id,
        current_index: user_data.current_index,
        question: q
    });
});

// クイズ質問への回答API [POST only]
app.post('/api/answerQuestion', (req, res) => {
    console.log('API answerQuestion function called!');
    console.log(req.body);
    const user_id = req.body.user_id;
    const question_id = req.body.question_id;
    const answer = req.body.answer;
    let answer_result = quiz.answerQuestionFor(user_id, question_id, answer);
    const user_data = quiz.getUserDataFor(user_id);
    if (answer_result === null) {
        answer_result = [];
        answer_result['result'] = null;
        answer_result['question'] = null;
    }
    res.json({
        user_id: user_id,
        current_index: user_data.current_index,
        result: answer_result.result,
        question: answer_result.question,
        quiz_finished: user_data.quiz_finished
    });
});

// 現在の質問取得API [POST only]
app.post('/api/getCurrentQuestion', (req, res) => {
    console.log('API getCurrentQuestion function called!');
    console.log(req.body);
    const user_id = req.body.user_id;
    const q = quiz.getCurrentQuestionFor(user_id);
    const user_data = quiz.getUserDataFor(user_id);
    res.json({
        user_id: user_id,
        current_index: user_data.current_index,
        question: q
    });
});

// クイズ結果取得API [POST only]
app.post('/api/getQuizeResult', (req, res) => {
    console.log('API getQuizeResult function called!');
    console.log(req.body);
    const user_id = req.body.user_id;
    const quiz_result = quiz.getQuizeResultFor(user_id);
    // return score and message
    res.json(quiz_result);
});

// run express server
app.listen(port, () => {
    console.log(`Server running on ${port}`)
});
