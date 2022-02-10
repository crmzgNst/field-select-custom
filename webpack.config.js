const webpack = require('webpack')
const WebpackCleanPlugin = require('clean-webpack-plugin')
const WebpackCopyPlugin = require('copy-webpack-plugin')
const WebpackZipPlugin = require('zip-webpack-plugin')
const WebPackExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackDiskPlugin = require('webpack-disk-plugin')
const WebpackDashboardPlugin = require('webpack-dashboard/plugin')
const WebpackShellPlugin = require('webpack-shell-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// const getPort = require('get-port');
// var PORT;

// getPort().then((port)=>{
//     console.log(port)
//     PORT = port
// })


const path = require('path')

const fs = require('fs');

module.exports = (env = {}) => {

    const NAME = path.basename(__dirname);
    const CWD = process.cwd()
    const BUILD_OUTPUT = env.build_output || 'build';
    const DEPLOY_COMMAND = env.deploy_command;
    const BUILD_DIR = path.resolve(BUILD_OUTPUT) // || path.resolve(CWD, 'build')
    const SRC_DIR = path.resolve(CWD, 'src')

    // const PKG = require('./package.json')

    const PRODUCTION = env.production === true 
    const DEV_URL = (!PRODUCTION && env.url) || '' // for DEVELOPMENT ONLY
    const ENV = PRODUCTION ? 'production' : 'development'
    const ZIP_FILE = `${NAME}.zip`
    const PORT = 8089
    const HOSTNAME = require('os').hostname()

    const certPath = 'C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates'

    let config = {
        target: 'web',
        context: SRC_DIR,
        cache: true,
        mode: ENV,
        entry: {
            [`${NAME}`]: ['./index.js']
        },
        output: {
            path: BUILD_DIR,
            filename: '[name].js',
            libraryTarget: 'amd',
            // publicPath: '/build/'
            publicPath: `https://${HOSTNAME}:${PORT}/build/`
        },
        devServer: {
            contentBase: [`https://${HOSTNAME}:${PORT}/build/`, DEV_URL],
            //publicPath: '/', //'http://usnyc-alj:8080/build/',
            // inline: true,
            host: HOSTNAME,
            hot: true,
            https: {
                key: fs.readFileSync(path.join(certPath,'server_key.pem')),
                cert: fs.readFileSync(path.join(certPath,'server.pem'))
            },
            historyApiFallback: true,
            hotOnly: true,
            port: PORT,
            headers: {
                "Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            },
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        devtool: !PRODUCTION ? 'inline-source-map' : false,
        module: {
            rules: [
                // {
                //     test: /\.js$/,
                //     enforce: 'pre',
                //     loader: 'eslint-loader',
                //     options: {
                //       emitWarning: false,
                //     },
                // },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        presets:    [ "es2015" ]
                    }
                },
                {
                    test: /\.css$/,
                    use:  [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: { modules: false },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => ([
                                require('autoprefixer'),
                                require('precss'),
                                ]),
                            },
                        },
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader",  // creates style nodes from JS strings
                            options: {
                                insertAt: 'top'
                            }
                        },
                        {
                            loader: 'css-loader', // translates CSS into CommonJS
                            options: {
                                sourceMap: false
                            }
                        },
                        "sass-loader" // compiles Sass to CSS
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }]
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    use: [
                        {
                          loader: 'file-loader',
                          options: {}
                        }
                      ]
                  },
                {
                    test: /\.html$/,
                    loader: 'raw-loader'
                },
/*                    
                    use:  WebPackExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            use: [ 
                                {
                                    loader: 'css-loader',
                                    options: { importLoaders: 1 },
                                },
                                {
                                    loader: 'postcss-loader',
                                    options: {
                                        plugins: () => ([
                                        require('autoprefixer'),
                                        require('precss'),
                                        ]),
                                    },
                                },
                            ]
                    })
                }
*/                
            ]
        },
        resolve: {
            extensions: ['.js']
        },
        externals: [
            'qlik',
            'js/qlik',
            'jquery',
            'underscore',
            'ng!$q'
        ],
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new WebpackCleanPlugin([BUILD_DIR, ZIP_FILE]),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(ENV)
            }),
            // new WebPackExtractTextPlugin("styles.css"),
            new WebpackCopyPlugin([{
                from: 'template.qext',
                to: path.resolve(BUILD_DIR, `${NAME}.qext`)
            }]),
            new WebpackCopyPlugin([{
                from: 'wbfolder.wbl',
                to: path.resolve(BUILD_DIR, 'wbfolder.wbl')
            }])
        ]
    }

    if(PRODUCTION) {

        config.optimization = {
            minimizer: [
                new UglifyJsPlugin()
            ]
        }
        config.plugins.push(
            // new webpack.optimize.UglifyJsPlugin({
            //     compress: {
            //         warnings: false
            //     }
            // }),
            new WebpackZipPlugin({
                filename: ZIP_FILE,
            })
        )

        if(DEPLOY_COMMAND)
            config.plugins.push(
                new WebpackShellPlugin({onBuildEnd:[DEPLOY_COMMAND]})
            );


        config.devtool = false
    } else {
        // Development mode
        config.plugins.push(
            // new WebpackDashboardPlugin(), // if you need webpack dashboard uncomment it and add "webpack-dashboard --" in package json for dev command at the very beginning
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new WebpackDiskPlugin({
                output: {
                    path: BUILD_OUTPUT
                },
                files: [
                    {
                        asset: /[name]/,
                        output: { 
                            filename: function(assetname) {
                                // excludes hot-updates from writing to disk to new file every time
                                const matches = assetname.match(/(hot-update\.(js|json))$/)
                                if(matches && matches.length > 0) {
                                    return matches[0];
                                }

                                return assetname;
                            }
                        }
                    }
                ]
            })
        );
    }
    console.log(PORT)

    return config;
}
