const app = new Vue({
    el: '#app',
    template: '#quiz',
    data: {
        line_user_id: null,
        liff_initialized: false,
        api_loading: false,
        api_result: null,
        current_index: -1,
        quiz_finished: false,
        quiz_mode: 'ASKING',
        current_question: {
            title: null,
            choices: []
        },
        question_result: false,
        quiz_result: {
            score: -1,
            message: null
        }
    },
    methods: {
        // vConsole の初期化
        initVConsole() {
            console.log('function initVConsole called!');
            window.vConsole = new window.VConsole({
                defaultPlugins: ['system', 'network', 'element', 'storage'],
                maxLogNumber: 1000,
                onReady: function () {
                    console.log('vConsole is ready.');
                },
                onClearLog: function () {
                    console.log('on clearLog');
                }
            });
        },
        // LINE LIFF の初期化
        initLiff() {
            console.log('function initLiff called!');
            this.api_loading = true;
            liff.init(
                data => {
                    console.log('LIFF initialized!')
                    this.line_user_id = data.context.userId;
                    console.log('user_id: ' + this.line_user_id);
                    this.liff_initialized = true;
                    this.api_loading = false;
                    // LIFF初期化完了後にクイズの初期化を行う
                    this.initQuiz();
                },
                error => {
                    // LIFF initialization failed
                    this.line_user_id = 'no_user_id';
                    console.warn('Could not get line_user_id...');
                    console.warn(error);
                    this.liff_initialized = false;
                    this.api_loading = false;
                }
            )
        },
        // クイズ初期化APIの実行
        async initQuiz() {
            console.log('function initQuiz called!');
            this.api_loading = true;
            const params = {
                user_id: this.line_user_id
            };
            const api_url = '/api/initializeQuiz';
            const response = await axios.post(api_url, params).catch(function (err) {
                this.api_loading = false;
                console.error('API POST initializeQuiz failed', err);
                throw err;
            });
            this.api_loading = false;
            console.log('Response: ', response);
            this.api_result = response.data;
            console.log('Response JSON: ', this.api_result);
            this.current_question = this.api_result.question;
            this.current_index = this.api_result.current_index;
            this.quiz_mode = 'ASKING';
        },
        // クイズ質問への回答APIの実行
        async answerQuestion(question_id, answer) {
            console.log('function answerQuestion called!');
            console.log('question_id: ' + question_id);
            console.log('answer: ' + answer);
            this.api_loading = true;
            const params = {
                user_id: this.line_user_id,
                question_id: question_id,
                answer: answer
            };
            const api_url = '/api/answerQuestion';
            const response = await axios.post(api_url, params).catch(function (err) {
                this.api_loading = false;
                console.error('API POST answerQuestion failed', err);
                throw err;
            });
            this.api_loading = false;
            console.log('Response: ', response);
            this.api_result = response.data;
            console.log('Response JSON: ', this.api_result);
            this.question_result = this.api_result.result;
            this.current_question = this.api_result.question;
            this.current_index = this.api_result.current_index;
            this.quiz_finished = this.api_result.quiz_finished;
            this.quiz_mode = 'ANSWERED';
        },
        // 現在の質問取得APIの実行
        async getCurrentQuestion() {
            console.log('function getCurrentQuestion called!');
            this.api_loading = true;
            const params = {
                user_id: this.line_user_id
            };
            const api_url = '/api/getCurrentQuestion';
            const response = await axios.post(api_url, params).catch(function (err) {
                this.api_loading = false;
                console.error('API POST getCurrentQuestion failed', err);
                throw err;
            });
            this.api_loading = false;
            console.log('Response: ', response);
            this.api_result = response.data;
            console.log('Response JSON: ', this.api_result);
            this.current_question = this.api_result.question;
            this.current_index = this.api_result.current_index;
            this.quiz_mode = 'ASKING';
        },
        // クイズ結果取得APIの実行
        async getQuizeResult() {
            console.log('function getQuizeResult called!');
            this.api_loading = true;
            const params = {
                user_id: this.line_user_id
            };
            const api_url = '/api/getQuizeResult';
            const response = await axios.post(api_url, params).catch(function (err) {
                this.api_loading = false;
                console.error('API POST getQuizeResult failed', err);
                throw err;
            });
            this.api_loading = false;
            console.log('Response: ', response);
            this.api_result = response.data;
            console.log('Response JSON: ', this.api_result);
            this.quiz_result = this.api_result;
            this.quiz_mode = 'COMPLETED';
        },
        // LIFF ウインドウを閉じる
        closeLiffWindow() {
            console.log('function closeLiffWindow called!');
            if (this.liff_initialized === true) {
                console.log("Closing LIFF page");
                liff.closeWindow();
            }
        },
    },
    // 初期化処理
    mounted: async function() {
        Promise.all([
            this.initVConsole(),
            this.initLiff()
        ]);
    }
});
