/**
 * 应用程序的启动（入口）文件
 * */



/*
 用户发送http请求  url 解析路由  找到匹配的规则 执行绑定的函数 返回对应的内容至客户端
 * /public 静态 直接读取指定目录下的文件，返回给永固
 * app.get('/', 动态 处理业务逻辑，加载模板，解析模板 返回数据给客户端
 * */


var express = require('express');

// 加载模板处理模块
var swig = require('swig');

// 加载数据库模块
var mongoose = require('mongoose');

// 加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser');

// 加载cookie模块
var Cookies = require('cookies');

// 创建app应用
var app = express();

var User = require('./models/User');

// 设置静态文件托管
// 当用户访问的url已/public开始，那么直接返回对应的__dirname + '/public'的文件
app.use('/public', express.static(__dirname + '/public'));

// 配置应用模板
// 定义当前应用所使用的模板引擎
// 第一个参数，模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);
// 设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views', './views');
// 注册所使用的模板引擎，第一个参数必须是view engine, 第二个参数和app.engine这个方法中定义的模板引擎名称（第一个参数）是一致的
app.set('view engine', 'html');
// 开发过程中需要取消模板缓存
swig.setDefaults({cache: false});

// bodyparser设置  bodyParser.urlencoded方法调用会自动在req上绑定一个body，body上绑定的是post提交过来的参数
app.use(bodyParser.urlencoded({extended: true}));

// 设置cookie
app.use(function(req, res, next) {
	req.cookies = new Cookies(req, res);
	
	// 解析登陆用户的cookie信息
	req.userInfo = {};
	if (req.cookies.get('userInfo')) {
		try {
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
			// 获取当前登录用户的类型，是否是管理员
			User.findById(req.userInfo._id).then(function(userInfo) {
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			});
		} catch(e) {
			next();
		};
	}
//	console.log(req.cookies.get('userInfo'));
	next();
});


//app.get('/', function(req, res, next) {
//	/*
//	 *读取vies目录下的指定文件，解析并返回给客户端 
//	 * 第一个参数：表示模板的文件，相对于views目录 views/index.html
//	 * 第二个参数：传递给模板使用的数据
//	 * */
//	res.render('index');
//});

/*
 
 * 根据不同的功能划分模块
 * */
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/main', require('./routers/main'));

mongoose.connect('mongodb://localhost:27018/blog', function(err) {
	if (err) {
		console.log(err);
		console.log('数据库连接失败');
	} else {
		console.log('数据库连接成功')
		// 监听http请求
		app.listen(8081);
	}
});





