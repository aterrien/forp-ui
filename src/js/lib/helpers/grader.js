(function(forp, $) {

    "use strict";

    /**
     * Grader Class
     *
     * Provides grades, quality metrics
     */
    forp.Grader = function()
    {
        this.grades = {
            time : {
                A : {
                    min : 0, max : 100, tip : ["Very good job !", "The planet will reward you !", "You'll be the king at the coffee machine.", "Your servers thanks you."]
                },
                B : {
                    min : 100, max : 300, tip : ["Good job !"]
                },
                C : {
                    min : 300, max : 600, tip : ["You are close to job performance."]
                },
                D : {
                    min : 600, max : 1000, tip : ["You are under one second.", "Think cache."]
                },
                E : {
                    min : 1000, max : 2000, tip : ["At your own risk !"]
                }
            },
            memory : {
                A : {
                    min : 0, max : 2000, tip : ["Very good job !"]
                },
                B : {
                    min : 2000, max : 4000, tip : ["Good job !"]
                },
                C : {
                    min : 4000, max : 8000, tip : ["Respectable"]
                },
                D : {
                    min : 8000, max : 12000, tip : ["It seems that you load too much data."]
                },
                E : {
                    min : 12000, max : 20000, tip : ["It seems that you load too much data."]
                }
            },
            includes : {
                A : {
                    min : 0, max : 5, tip : ["Very good job !"]
                },
                B : {
                    min : 5, max : 20, tip : ["Good job !"]
                },
                C : {
                    min : 30, max : 60, tip : ["A builder script could do the rest."]
                },
                D : {
                    min : 60, max : 120, tip : ["A builder script could be your best friend on this."]
                },
                E : {
                    min : 120, max : 240, tip : ["At your own risk !", "A builder script could be your best friend on this."]
                }
            },
            calls : {
                A : {
                    min : 0, max : 2000, tip : ["Very good job !", "This is the 'Hello world' script ?"]
                },
                B : {
                    min : 2000, max : 4000, tip : ["Very good job !"]
                },
                C : {
                    min : 4000, max : 8000, tip : ["Respectable"]
                },
                D : {
                    min : 8000, max : 16000, tip : ["Has a bad impact on performance."]
                },
                E : {
                    min : 32000, max : 64000, tip : ["It's a joke ?", "At your own risk !", "Too many instructions."]
                }
            },
            nesting : {
                E : {
                    min : 0, max : 5, tip : ["This is the 'Hello world' script ?"]
                },
                A : {
                    min : 5, max : 10, tip : ["Good job !"]
                },
                B : {
                    min : 10, max : 15, tip : ["Respectable"]
                },
                C : {
                    min : 15, max : 20, tip : ["Respectable"]
                },
                D : {
                    min : 20, max : 30, tip : ["Perhaps, are you currently refactoring ?"]
                }
            }
        };

        this.getGrade = function(gradeName, mesure) {
            for(var grade in this.grades[gradeName]) {
                if( mesure >= this.grades[gradeName][grade]['min']
                    && mesure <= this.grades[gradeName][grade]['max']
                ) {
                    return grade;
                }
            }
            return grade;
        };

        this.getTip = function(gradeName, grade) {
            var i = Math.floor((Math.random() * this.grades[gradeName][grade]['tip'].length));
            return this.grades[gradeName][grade]['tip'][i];
        };

        this.getClass = function(grade) {
            return "grade-" + grade;
        };

        this.getGradeWithTip = function(gradeName, mesure) {
            var grade = this.getGrade(gradeName, mesure);
            return $('<div>')
                    .append(
                        $('<div>')
                            .class(this.getClass(grade))
                            .text(grade)
                    )
                    .append(
                        $('<span>')
                            .text(this.getTip(gradeName, grade))
                    );
        };
    };
})(forp, jMicro);