const http = require('http');

const url = require('url');

const mime = require('mime');

const path = require('path');

const querystring = require('querystring')

const fs = require('fs');

const template = require('art-template');

template.config('base', path.join(__dirname, 'views'));

const students = require('./database/students');

const server = http.createServer();

server.listen(3000);

server.on('request', (req, res) => {

	//封装渲染方法

	res.render = function(tpl, data){

		let html = template(tpl, data);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	}

	//路由
	// /或者/add 		=>	add.html
	// /list 			=>	list.html

	//地址和路由有映射关系
	let pathname = url.parse(req.url).pathname;

	switch(pathname){
		case '/':
		case '/add':
		//加载add.html
		res.render('add', {});
			break;

		case '/list':
		res.render('list', {lists: students});
			break;

		case '/save':
		res.body = '';
		req.on('data', (chunk) => {
			res.body += chunk;
		});
		req.on('end', () => {
			let formData = querystring.parse(res.body);
			//将提交的数据存储起来
			let database = path.join(__dirname, 'database/students.json');
			fs.open(database, 'w', (err, fd) => {
				if(err){
					return res.end('internal error')
				}
				//将数据追加到原来的数据里
				students.push(formData);
				fs.write(fd, JSON.stringify(students), (err) => {
					//302
					//指示浏览器重定向
					//通过location设定跳转地址
					res.writeHead(302, {'Location': '/list'});
					res.end();
				});
			});
		});
			break;

		default:
		fs.readFile(path.join('public', pathname), (err, file) => {
			if(err){
				return res.end("not found");
			}

			res.writeHead(200,{'Content-Type': mime.lookup(pathname)});

			res.end(file);
		});
	}
});