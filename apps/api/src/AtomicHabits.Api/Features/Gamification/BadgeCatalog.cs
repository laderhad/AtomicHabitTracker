namespace AtomicHabits.Api.Features.Gamification;

public static class BadgeCodes
{
    public const string FirstHabit = "first_habit";
    public const string FirstCheckIn = "first_check_in";
    public const string ThreeDayStreak = "three_day_streak";
    public const string SevenDayStreak = "seven_day_streak";
    public const string TenCheckIns = "ten_check_ins";
    public const string FirstWeeklyReview = "first_weekly_review";
    public const string FirstChallenge = "first_challenge";
    public const string FirstChallengeCheckIn = "first_challenge_check_in";
    public const string FirstShareCard = "first_share_card";
}

public sealed record BadgeDefinition(
    string Code,
    string Category,
    int SortOrder,
    string TitleTr,
    string DescriptionTr,
    string TitleEn,
    string DescriptionEn);

public static class BadgeCatalog
{
    public const string DefaultCulture = "en-US";
    public const string TurkishCulture = "tr-TR";
    public const string EnglishCulture = "en-US";

    public static readonly IReadOnlyCollection<BadgeDefinition> All =
    [
        new(
            BadgeCodes.FirstHabit,
            "foundation",
            10,
            "İlk alışkanlık",
            "İlk sistemini kurdun.",
            "First habit",
            "You set up your first system."),
        new(
            BadgeCodes.FirstCheckIn,
            "foundation",
            20,
            "İlk check-in",
            "Bir davranışı tamamlayıp işaretledin.",
            "First check-in",
            "You completed and logged one behavior."),
        new(
            BadgeCodes.ThreeDayStreak,
            "streak",
            30,
            "Üç gün ritmi",
            "Bir alışkanlıkta 3 günlük seri yakaladın.",
            "Three-day rhythm",
            "You reached a three-day streak on one habit."),
        new(
            BadgeCodes.SevenDayStreak,
            "streak",
            40,
            "Yedi gün sistemi",
            "Bir alışkanlığı bir hafta boyunca sürdürdün.",
            "Seven-day system",
            "You kept one habit going for a week."),
        new(
            BadgeCodes.TenCheckIns,
            "consistency",
            50,
            "On küçük adım",
            "Toplam 10 tamamlanmış check-in yaptın.",
            "Ten small steps",
            "You logged 10 completed check-ins."),
        new(
            BadgeCodes.FirstWeeklyReview,
            "reflection",
            60,
            "İlk haftalık bakış",
            "Haftanı gözden geçirip sistemi iyileştirdin.",
            "First weekly review",
            "You reviewed your week and improved the system."),
        new(
            BadgeCodes.FirstChallenge,
            "social",
            70,
            "İlk meydan okuma",
            "Bir challenge başlattın veya katıldın.",
            "First challenge",
            "You started or joined a challenge."),
        new(
            BadgeCodes.FirstChallengeCheckIn,
            "social",
            80,
            "Birlikte check-in",
            "Bir challenge için tamamlanmış davranış kaydettin.",
            "Shared check-in",
            "You logged a completed behavior for a challenge."),
        new(
            BadgeCodes.FirstShareCard,
            "sharing",
            90,
            "İlk paylaşım kartı",
            "İlerlemeni paylaşmaya hazır bir kart oluşturdun.",
            "First share card",
            "You created a card ready to share your progress.")
    ];

    public static BadgeDefinition? Find(string code)
    {
        return All.FirstOrDefault(item => item.Code == code);
    }

    public static string ResolveCulture(string? requestedCulture, string? preferredCulture)
    {
        var culture = string.IsNullOrWhiteSpace(requestedCulture)
            ? preferredCulture
            : requestedCulture;

        if (string.IsNullOrWhiteSpace(culture))
        {
            return DefaultCulture;
        }

        if (culture.StartsWith("tr", StringComparison.OrdinalIgnoreCase))
        {
            return TurkishCulture;
        }

        if (culture.StartsWith("en", StringComparison.OrdinalIgnoreCase))
        {
            return EnglishCulture;
        }

        return DefaultCulture;
    }
}
