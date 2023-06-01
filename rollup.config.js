import commonJS from "rollup-plugin-commonjs";  
import typescript from "rollup-plugin-typescript2";  
import dts from "rollup-plugin-dts";
var name = 'movi';
var dist = function (p) { return './dist/index.' + p; } 
var distS = function (p) { return './dist/' + p; } 
export default [
    {
        input: "packages/movi/src/index.ts",
        output: [
            {
                name: name,
                file: dist("js"),
                format: "iife",
                sourceMap: 'inline',
            },
            {
                name: name,
                file: dist("min.js"),
                format: "iife",
                sourceMap: 'inline', 
            },
            {
                name: name,
                file: dist("umd.js"),
                format: "umd",
            },
            {
                name: name,
                file: dist("umd.min.js"),
                format: "umd", 
            },
            {
                name: name,
                file: dist("cjs.js"),
                format: "cjs",
            },
            {
                name: name,
                file: dist("cjs.min.js"),
                format: "cjs", 
            },
            {
                name: name,
                file: dist("esm.js"),
                format: "esm",
            },
            {
                name: name,
                file: dist("esm.min.js"),
                format: "esm", 
            }
        ],
        experimentalCodeSplitting: true,
        plugins: [  
            commonJS(),
            typescript({
                 declaration: true,
                 esModuleInterop: true,
                 moduleResolution: "Node",  
                 target: "ES6",
                 module: "ESNext",
                 lib: ["DOM", "ES2021"],
                 noEmitHelpers: true,
                 importHelpers: false
            }) 
        ],
        onwarn: function (warning) {
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
        },
    }, 
    {
        input: "./dist/movi/src/index.d.ts",
        output: [
            {
                name: name,
                file: distS("index.d.ts"),
                format: "iife",
                sourceMap: 'inline', 
            }
        ],
        experimentalCodeSplitting: true,
        plugins: [   
            dts()
        ],
        onwarn: function (warning) {
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
        },
    } 
];
