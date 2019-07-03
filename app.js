'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const quiz = require('./quiz');

// load environment variables
require('dotenv').config();

// LINE Bot Setting
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

// base URL for webhook server
const baseURL = process.env.BASE_URL;

// express
const app = new express();
const port = 3000;

// serve static & LIFF files
app.use('/static', express.static('static'));
app.use('/liff', express.static('liff'));

// constants
const QUIZ_START_MESSAGE = 'クイズ開始';
const POSTBACK_TYPE_ANSWER_QUESTION = 'QuestionAnswer';
const POSTBACK_TYPE_NEXT_QUESTION = 'NextQuestion';
const POSTBACK_TYPE_SHOW_QUIZ_RESULT = 'ShowQuizResult';

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

// LINE Bot webhook callback [POST only]
app.post('/linebot', line.middleware(config), (req, res) => {
    console.log('LINE Bot webhook callback handle function called!');
    if (req.body.destination) {
        console.log("Destination User ID: " + req.body.destination);
    }
    // req.body.events should be an array of events
    if (!Array.isArray(req.body.events)) {
        return res.status(500).end();
    }
    // handle each event
    Promise
        .all(req.body.events.map(handleEvent))
        .then(() => res.end())
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// callback function to handle a single event
function handleEvent(event) {
    if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
        return console.log("Test hook recieved: " + JSON.stringify(event.message));
    }
    // handle event
    switch (event.type) {
        // handle message event
        case 'message':
            const message = event.message;
            switch (message.type) {
                // handle Text message
                case 'text':
                    return handleText(message, event.replyToken, event.source);
                // unknown message
                default:
                    replyText(replyToken, 'よく分かりませんでした');
            }
        // handle follow(友だち追加) event
        case 'follow':
            return replyText(event.replyToken, 'お友だち追加ありがとうございます！');
        // handle unfollow(ブロック) event
        case 'unfollow':
            return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);
        // handle join(グループ参加) event
        case 'join':
            return replyText(event.replyToken, `Joined ${event.source.type}`);
        // handle leave(グループ退室) event
        case 'leave':
            return console.log(`Left: ${JSON.stringify(event)}`);
        // handle Postback event
        case 'postback':
            return handlePostback(event);
        // unknown event
        default:
            throw new Error(`Unknown event: ${JSON.stringify(event)}`);
    }
};

// simple reply function
function replyText (token, texts) {
    texts = Array.isArray(texts) ? texts : [texts];
    return client.replyMessage(
        token,
        texts.map((text) => ({ type: 'text', text }))
    );
};

// handle TextMessage
function handleText(message, replyToken, event_source) {
    console.log('handleText function called!');
    const message_text = message.text;
    console.log('message text: ' + message_text);
    const user_id = event_source.userId;
    if (message_text === QUIZ_START_MESSAGE) {
        const user_data = quiz.initializeQuizFor(user_id);
        const q = quiz.getCurrentQuestionFor(user_id);
        const q_message = generateQuestionMessage(user_data.current_index, q);
        return client.replyMessage(
            replyToken,
            q_message
        );
    } else {
        return replyText(replyToken, message.text);
    }
};

// handle Postback event
function handlePostback(event) {
    console.log('handlePostback function called!');
    let data = event.postback.data;
    const user_id = event.source.userId;
    const replyToken = event.replyToken;
    // Postback データからパラメーターを解析
    const params = parseQuizPostbackData(data);
    console.log(`Postback Data: ${JSON.stringify(params)}`);
    const postback_type = params['type'];
    if (postback_type === POSTBACK_TYPE_ANSWER_QUESTION) {
        // 質問への回答の場合
        const question_id = parseInt(params['id']);
        const answer = parseInt(params['answer']);
        const answer_result = quiz.answerQuestionFor(user_id, question_id, answer);
        const user_data = quiz.getUserDataFor(user_id);
        let message = {};
        if (answer_result != null) {
            // 回答結果のメッセージを返す
            message = generateQuestionAnswerMessage(
                answer_result['result'], 
                answer_result['question'].comment,
                user_data.quiz_finished
            );
        } else {
            // 回答が不正であった場合
            message = generateInvalidOperationMessage();
        }
        return client.replyMessage(replyToken, message);
    } else if (postback_type === POSTBACK_TYPE_NEXT_QUESTION) {
        // 次の問題へ
        const user_data = quiz.getUserDataFor(user_id);
        const q = quiz.getCurrentQuestionFor(user_id);
        const q_message = generateQuestionMessage(user_data.current_index, q);
        return client.replyMessage(replyToken, q_message);
    } else if (postback_type === POSTBACK_TYPE_SHOW_QUIZ_RESULT) {
        // クイズの結果を見る
        const quiz_result = quiz.getQuizeResultFor(user_id);
        let message = {};
        if (quiz_result != null) {
            // TODO クイズの結果をFlexMessage で返す
            message = {'type': 'text', 'text': quiz_result['message']};
        } else {
            // 回答が終わっていなかった場合
            message = generateInvalidOperationMessage();
        }
        return client.replyMessage(replyToken, message);
    } else {
        // その他の場合はそのまま帰す
        return replyText(replyToken, `Got postback: ${data}`);
    }
};

// 質問用のFlexMessage を生成する
function generateQuestionMessage(index, question) {
    console.log('generateQuestionMessage function called!');
    console.log(`Question: ${JSON.stringify(question)}`);
    // FlexMessage の中身を生成
    const message_text = `${index + 1}問目\n${question.title}`
    const message = {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                {
                    "type": "text",
                    "text": message_text,
                    "size": "lg",
                    "weight": "bold",
                    "wrap": true
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "spacer",
                    "size": "xxl"
                }
            ]
        }
    };
    // 選択肢用のボタンを生成する
    for (let i = 0; i < question.choices.length; i++) {
        const choice = question.choices[i];
        const label = `${i + 1}. ${choice}`
        const data = `type=${POSTBACK_TYPE_ANSWER_QUESTION}&id=${question.id}&answer=${i}`
        const button = {
            "type": "button",
            "style": "primary",
            "margin": "md",
            "action": {
                "type": "postback",
                "label": label,
                "displayText": label,
                "data": data
            }
        };
        if (i === 0 || i % 2 === 0) {
            button['color'] = '#905c44';
        }
        message.footer.contents.push(button);
    }
    console.log(`Message: ${JSON.stringify(message)}`);
    return {
        "type": "flex",
        "altText": message_text,
        "contents": message
    };
};

// 質問への回答結果表示用のFlexMessage を生成する
function generateQuestionAnswerMessage(answer_result, result_message, quiz_finished) {
    console.log('generateQuestionAnswerMessage function called!');
    console.log(`Answer result: ${JSON.stringify(answer_result)}`);
    console.log(`Result message: ${JSON.stringify(result_message)}`);
    console.log(`Quiz finished: ${JSON.stringify(quiz_finished)}`);
    // FlexMessage の中身を生成
    let button_label = '次の問題へ';
    let postback_data = `type=${POSTBACK_TYPE_NEXT_QUESTION}`;
    if (quiz_finished === true) {
        button_label = 'クイズの結果を見る';
        postback_data = `type=${POSTBACK_TYPE_SHOW_QUIZ_RESULT}`;
    }
    let message_prefix = '残念！不正解です。';
    let image_url = `${baseURL}/static/x-mark.png`;
    if (answer_result === true) {
        message_prefix = 'おめでとうございます。正解です！';
        image_url = `${baseURL}/static/circle.png`;
    }
    const message = {
        "type": "bubble",
        "hero": {
            "type": "image",
            "size": "xxl",
            "aspectRatio": "1:1",
            "aspectMode": "cover",
            "url": image_url
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                {
                    "type": "text",
                    "text": message_prefix,
                    "size": "lg",
                    "weight": "bold",
                    "wrap": true
                },
                {
                    "type": "text",
                    "text": result_message,
                    "size": "md",
                    "wrap": true
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "spacer",
                    "size": "xxl"
                },
                {
                    "type": "button",
                    "style": "primary",
                    "margin": "md",
                    "action": {
                        "type": "postback",
                        "label": button_label,
                        "displayText": button_label,
                        "data": postback_data
                    }
                }
            ]
        }
    };
    console.log(`Message: ${JSON.stringify(message)}`);
    return {
        "type": "flex",
        "altText": `${message_prefix}\n${result_message}`,
        "contents": message
    };
};

// 不正な操作があった場合のFlexMessage を生成する
function generateInvalidOperationMessage() {
    console.log('generateInvalidOperationMessage function called!');
    // FlexMessage の中身を生成
    const button_label = 'はじめからやり直す';
    const message_text = '不正な操作が行われました。もう一度はじめから回答してください。';
    const message = {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                {
                    "type": "text",
                    "text": message_text,
                    "size": "lg",
                    "weight": "bold",
                    "wrap": true
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "spacer",
                    "size": "xxl"
                },
                {
                    "type": "button",
                    "style": "primary",
                    "margin": "md",
                    "action": {
                        "type": "message",
                        "label": button_label,
                        "text": QUIZ_START_MESSAGE
                    }
                }
            ]
        }
    };
    console.log(`Message: ${JSON.stringify(message)}`);
    return {
        "type": "flex",
        "altText": message_text,
        "contents": message
    };
};

// Postback のデータを分解する
function parseQuizPostbackData(postbackData) {
    console.log('parseQuizPostbackData function called!');
    console.log(`Postback Data: ${JSON.stringify(postbackData)}`);
	// パラメータを"&"で分離する
    const params = postbackData.split('&');
	const result = {};
	let values = null;
	for(var i = 0 ; i < params.length ; i++) {
		// "&"で分離したパラメータを"="で再分離
        values = params[i].split('=');
		result[values[0]] = values[1];
	}
	return result;
}

// run express server
app.listen(port, () => {
    console.log(`Server running on ${port}`)
});
