from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobposting',
            name='required_skills',
            field=models.TextField(
                blank=True,
                help_text='Comma-separated required skills e.g. Python,SQL,AWS'
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='sentiment_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='review',
            name='sentiment_label',
            field=models.CharField(blank=True, max_length=20),
        ),
    ]
