const gulp = require('gulp');

gulp.task('copy-grammar', () =>
  gulp
    .src([
      './src/grammars/tmGrammars/*.*'
    ])
    .pipe(gulp.dest('./lib/grammars/tmGrammars/'))
);
