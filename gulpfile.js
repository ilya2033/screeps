let gulp = require("gulp");
let screeps = require("gulp-screeps");
let flattenImports = require("gulp-flatten-imports");
let credentials = require("./.credentials.js");
let typescript = require("gulp-typescript");
let clean = require("gulp-clean");

let flatten = require("gulp-flatten");

gulp.task("flatten-folders", function () {
    return gulp
        .src("./src/**/*.ts")
        .pipe(flatten())
        .pipe(flattenImports())
        .pipe(
            typescript({
                esModuleInterop: true,
                module: "commonjs",
                target: "ES2019",
                outDir: "build",
                rootDir: "src",
                watch: true,
                typeRoots: ["src/@types", "node_modules/@types"],
                error: true,
            }).on("error", () => {
                /* Ignore compiler errors */
            })
        )
        .pipe(gulp.dest("./dist"));
});

gulp.task("screeps", async function () {
    gulp.src("dist/*.js").pipe(screeps(credentials));
});

gulp.task("clean", function () {
    return gulp.src("./dist", { read: false }).pipe(clean());
});

exports.default = gulp.series("clean", "flatten-folders", "screeps");
