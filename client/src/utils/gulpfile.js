const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));


function build(){
    return src('../../public/scss/*.scss')
    .pipe(sass())
    .pipe(dest('../../public/css'))
}

function watchScss(){
    watch(['../../public/scss/*.scss'], build)
}
exports.default = series(build, watchScss)