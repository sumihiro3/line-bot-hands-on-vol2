'use strict';

const cache = require("memory-cache");

module.exports.version = function () {
    return '1.0';
};

// ユーザーの状態を初期化する
module.exports.initializeQuizFor = function (user_id) {
    console.log('function initializeQuizFor called!');
    console.log('user_id : ' + user_id);
    // クイズの問題をランダムに並び替える
    let randomSortedQuestions = QUIZ_QUESTIONS.slice();
    randomSortedQuestions.sort(function () {
        return Math.random() - 0.5;
    });
    // 5問抽出する
    let questions = randomSortedQuestions.filter(function (item, index) {
        if (index < 5) {
            return true;
        }
    });
    // cache に保存する
    const user_data = {
        'questions': questions,
        'current_index': 0,
        'answers': [],
        'quiz_finished': false
    }
    cache.put(user_id, user_data);
    return user_data;
};

// 現在の質問を取得する
module.exports.getCurrentQuestionFor = function (user_id) {
    console.log('function getCurrentQuestionFor called!');
    console.log('user_id : ' + user_id);
    const user_data = this.getUserDataFor(user_id);
    // 現在の問題を取得
    const current_q = user_data.questions.filter(function (item, index) {
        if (index === user_data.current_index) {
            return true;
        }
    });
    return current_q[0];
};

// 現在の質問に対して回答する
module.exports.answerQuestionFor = function (user_id, question_id, answer) {
    console.log('function answerQuestionFor called!');
    console.log('user_id : ' + user_id);
    console.log('question_id : ' + question_id);
    console.log('answer : ' + answer);
    const user_data = this.getUserDataFor(user_id);
    const current_q = this.getCurrentQuestionFor(user_id);
    if (current_q == null || current_q.id !== question_id) {
        // 問題と回答が一致しなければnull を返す
        return null;
    }
    answer = parseInt(answer);
    // 正解かどうかの判定
    let is_answer_correct = false;
    if (current_q.correct === answer) {
        is_answer_correct = true;
    }
    // 回答結果を保存する
    user_data.answers.push({
        'question_id': current_q.id,
        'answer': answer,
        'result': is_answer_correct
    });
    // 最終質問への回答であればクイズ終了
    user_data.current_index += 1;
    if (user_data.questions.length <= user_data.current_index) {
        user_data.quiz_finished = true;
    }
    // 保存
    cache.put(user_id, user_data);
    return {
        'result': is_answer_correct,
        'question': current_q
    }
};

// クイズの結果を取得する
module.exports.getQuizeResultFor = function (user_id) {
    console.log('function getQuizeResultFor called!');
    console.log('user_id : ' + user_id);
    const user_data = this.getUserDataFor(user_id);
    console.log('user_data: ' + JSON.stringify(user_data));
    if (user_data.quiz_finished === false) {
        // クイズが終了（最後まで回答済み）していない場合は、結果は返さない
        return null;
    }
    // 集計
    let correctAnswers = user_data.answers.filter(function (item, index) {
        if (item.result === true) {
            return true;
        }
    });
    let score = correctAnswers.length * 2;
    let result_message = '残念…' + score + '点でした。次回頑張りましょう〜！';
    if (score >= 10) {
        result_message = 'ワンダフル！！！！満点でした。あなたは天才ですか？？';
    } else if (score > 5) {
        result_message = '素晴らしい！' + score + '点でした。とても物知りですね！';
    }
    return {
        'score': score,
        'message': result_message
    }
};

// ユーザーのクイズ状況を取得する
module.exports.getUserDataFor = function (user_id) {
    console.log('function getUserDataFor called!');
    console.log('user_id : ' + user_id);
    let user_data = cache.get(user_id);
    if (user_data == null) {
        // 保存されていなければ初期化して保存しておく
        user_data = this.initializeQuizFor(user_id);
        cache.put(user_id, user_data);
    }
    return user_data;
};

// 指定IDの質問情報を取得する
module.exports.getQuestion = function (question_id) {
    console.log('function getQuestion called!');
    console.log('question_id : ' + question_id);
    // id が一致した内容を返す
    let matchedQuestion = QUIZ_QUESTIONS.filter(function (item, index) {
        if (item.id === question_id) {
            return true;
        }
    });
    result = [];
    if (matchedQuestion.length > 0) {
        result = matchedQuestion[0];
    }
    return result;
};

// クイズの質問データ
const QUIZ_QUESTIONS = [
    {
        "choices": [
            "ゴマ",
            "海藻",
            "土"
        ],
        "comment": "正解は２ばんの「海藻」\n\n現在は昔と製法が変わってコンニャクが白くなったのだが、昔のように黒っぽい見た目の方がみんなに好まれるので、あえて海藻などを入れて昔と変わらない見た目にしている。\n\n昔はコンニャクの皮がまじって黒いつぶつぶになっていた。",
        "correct": 1,
        "id": 1,
        "title": "コンニャクにある黒いつぶつぶの正体は何？"
    },
    {
        "choices": [
            "ロシア語で煮込み料理",
            "ロシア語でタマネギ",
            "人の名前"
        ],
        "comment": "正解は３ばんの「人の名前」\n\nストロガノフ伯爵の家に伝わる料理だからビーフストロガノフ。\n\nちなみにこのビーフは牛という意味ではない。ビーフ（ビフ）はロシア語で「～流、～風」という意味である。",
        "correct": 2,
        "id": 2,
        "title": "ビーフストロガノフのストロガノフって何？"
    },
    {
        "choices": [
            "レッド",
            "ブルー",
            "イエロー"
        ],
        "comment": "正解は２ばんの「ブルー」\n\n肉の表面を数秒だけ焼く焼き加減のことをブルーと呼ぶ。",
        "correct": 1,
        "id": 3,
        "title": "つぎのうちでレア、ミディアム、ウェルダンなどと同じく肉の焼き加減を表す言葉はどれ？"
    },
    {
        "choices": [
            "ねりもの",
            "金塊",
            "判子（ハンコ）"
        ],
        "comment": "正解は２ばんの「金塊」\n\n揚げられたチキンの色や形が金塊のように見えたため、チキンナゲットと名付けられたのだ。",
        "correct": 1,
        "id": 4,
        "title": "チキンナゲットのナゲットって何？"
    },
    {
        "choices": [
            "０カロリー",
            "5キロカロリー未満",
            "20キロカロリー未満"
        ],
        "comment": "正解は２ばんの「5キロカロリー未満」\n\n5キロカロリー未満であれば、ノンカロリーやカロリー０を名乗ってもいいことになっているのだ。",
        "correct": 1,
        "id": 5,
        "title": "ノンカロリーは何カロリー（100㎖（グラム）あたり）？"
    },
    {
        "choices": [
            "かぐわしい",
            "黒い",
            "お酢"
        ],
        "comment": "正解は１ばんの「かぐわしい」\n\nバルサミコ酢は「かぐわしい（いい匂いを放つ）お酢」という意味。（バルサミコはイタリア語）",
        "correct": 0,
        "id": 6,
        "title": "バルサミコ酢のバルサミコの意味はどれ？"
    },
    {
        "choices": [
            "鮭",
            "ニシン",
            "魚の卵ぜんぶ"
        ],
        "comment": "正解は３ばんの「魚の卵ぜんぶ」\n\nロシア語でイクラとは魚の卵全体を意味する。なので、イクラもカズノコもタラコもすべてロシア語でイクラということになる。",
        "correct": 2,
        "id": 7,
        "title": "ロシア語でイクラはどの魚の卵を意味する？"
    },
    {
        "choices": [
            "ジャガイモ",
            "スルメ",
            "ヒラメ"
        ],
        "comment": "正解は２ばんの「スルメ」\n\n他にも昆布や米などが神さまへの供え物として埋められている。",
        "correct": 1,
        "id": 8,
        "title": "相撲の土俵の下に埋められている食べ物はどれ？"
    },
    {
        "choices": [
            "ランクを示す言葉",
            "XOではなくバツとマル",
            "門外不出の調味料"
        ],
        "comment": "正解は１ばんの「ランクを示す言葉」\n\nXOとは、ブランデーの最高級ランク「エクストラオールド」のことである。高級感を出すためにXOと付けているので、ブランデーを使用しているわけではない。（使用しているメーカーもある）",
        "correct": 0,
        "id": 9,
        "title": "XO醤（エックスオージャン）のXOって何？"
    },
    {
        "choices": [
            "風味を出すため",
            "中身を見分けるため",
            "胃の負担を減らすため"
        ],
        "comment": "正解は２ばんの「中身を見分けるため」\n\n中身のあんこの種類を見分けるために元祖あんパンの木村屋がやりはじめたのだ。",
        "correct": 1,
        "id": 10,
        "title": "あんパンにはなぜゴマがついているのか？"
    },
    {
        "choices": [
            "調理方法によるちがい",
            "麺の太さのちがい",
            "地域によるちがい"
        ],
        "comment": "正解は２ばんの「麺の太さのちがい」\n\n麺の太さが1.3ミリ未満のものが「そうめん」、1.3ミリ以上1.7ミリ未満のものが「冷や麦」なのだ。",
        "correct": 1,
        "id": 11,
        "title": "そうめんと冷や麦のちがいは？"
    },
    {
        "choices": [
            "包む",
            "靴（くつ）",
            "キャベツ"
        ],
        "comment": "正解は３ばんの「キャベツ」\n\n生地の見た目がキャベツに似ているから「シュー」と呼ばれている。",
        "correct": 2,
        "id": 12,
        "title": "シュークリームの「シュー」の意味は？"
    },
    {
        "choices": [
            "馬の肉",
            "鹿の肉",
            "イノシシの肉"
        ],
        "comment": "正解は２ばん「鹿の肉」\n\nちなみに馬の肉は「さくら」、イノシシの肉は「ボタン」と呼ばれる。こういった呼び方は肉を食べるのを禁止されていた時代に隠語として生まれたものなのだ。",
        "correct": 1,
        "id": 13,
        "title": "「もみじ」とは何の肉のこと？"
    },
    {
        "choices": [
            "大豆",
            "そら豆",
            "エンドウ豆"
        ],
        "comment": "正解は３ばんの「エンドウ豆」\n\n未熟なエンドウの種子がグリーンピース。なので成熟するとエンドウ豆になる。\n\nちなみに、サヤエンドウも同じエンドウ豆の種子である。サヤエンドウ＞＞グリーンピース＞＞エンドウ豆",
        "correct": 2,
        "id": 14,
        "title": "グリーンピースはどの豆の仲間？"
    },
    {
        "choices": [
            "かっぱえびせん",
            "柿の種",
            "カール"
        ],
        "comment": "正解は２ばんの「柿の種」\n\n亀田の「柿の種」は金型をふんづけて変形した形が柿の種に似ていたので、そう名付けられたのだ。",
        "correct": 1,
        "id": 15,
        "title": "創業者のうっかりミスで誕生したお菓子はどれ？"
    },
    {
        "choices": [
            "焼き鳥",
            "団子",
            "おはぎ"
        ],
        "comment": "正解は１ばんの「焼き鳥」\n\n両国国技館の地下には巨大な焼き鳥工場があるのだ。",
        "correct": 0,
        "id": 16,
        "title": "両国国技館の地下で生産されている食べ物とは？"
    }
];
