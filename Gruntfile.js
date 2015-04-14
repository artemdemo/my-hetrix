module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            TypeScript: {
                command: 'node TypeScript/built/local/tsc.js --sourceMap --out js/app.js source/app.ts'
            }
        },
        less: {
            development: {
                options: {
                },
                files: {
                    "css/style.css": "source/less/style.less"
                }
            }
        },
        watch: {
            scripts: {
                files: ['source/**/*.ts', 'source/less/*.less', 'source/pages/*.html'],
                tasks: ['less', 'shell']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['less', 'shell', 'watch']);

};