function iniciarFlipcard() {
    if (Modernizr.csstransforms3d) {
        CSSPlugin.defaultTransformPerspective = 1000;

        TweenMax.set($('[card-verso]'), {
            rotationY: -180
        });

        $.each($('[flip-card-item]'), function (i, cardItem) {
            var cardFrente = $(cardItem).children('[card-frente]');
            var cardVerso = $(cardItem).children('[card-verso]');

            var tl = new TimelineMax({
                paused: true
            });

            tl.to(cardFrente, 0.5, {
                rotationY: 180
            }).to(cardVerso, 0.5, {
                rotationY: 0
            }, 0).to(cardItem, 0.3, {
                z: 50
            }, 0).to(cardItem, 0.3, {
                z: 0
            }, 0.3);
            cardItem.animation = tl;
        });
    }

    $('[flip-card-item]').attr('tabindex', 0);
    $('[flip-card-item] [card-frente]').attr('aria-hidden', false);
    $('[flip-card-item] [card-verso]').attr('aria-hidden', true);

    $('[flip-card-item]').on('click keydown', function (e) {
        if (e.type === 'keydown') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                virarCard(e.currentTarget);
            }
        } else if (e.type == 'click') {
            virarCard(e.currentTarget);
        }
    });
    
    igualarAlturasFlipcard();
}

function virarCard(card) {
    $(card).addClass('seen');
    $(card).toggleClass('flipped');

    if ($(card).hasClass('flipped')) {
        exibirVersoCard(card);
    } else {
        exibirFrenteCard(card);
    }
}

function exibirVersoCard(card) {
    var cardFrente = $(card).find('[card-frente]');
    var cardVerso = $(card).find('[card-verso]');

    if (Modernizr.csstransforms3d) {
        card.animation.play();
    } else {
        cardVerso.fadeIn();
        cardFrente.fadeOut();
    }

    cardFrente.attr('aria-hidden', true);
    cardVerso.attr('aria-hidden', false);
}

function exibirFrenteCard(card) {
    var cardFrente = $(card).find('[card-frente]');
    var cardVerso = $(card).find('[card-verso]');

    if (Modernizr.csstransforms3d) {
        card.animation.reverse();
    } else {
        cardFrente.fadeIn();
        cardVerso.fadeOut();
    }

    cardVerso.attr('aria-hidden', true);
    cardFrente.attr('aria-hidden', false);
}

function igualarAlturasFlipcard() {
    $('[flip-card-item], [card-frente], [card-verso]').matchHeight({
        byRow: true
    });
}
