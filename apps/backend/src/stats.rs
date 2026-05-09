/// Counts notes by length category. Pure logic, no DB.
pub fn categorize_length(text: &str) -> &'static str {
    let len = text.len();
    if len == 0 {
        "empty"
    } else if len < 10 {
        "short"
    } else if len < 100 {
        "medium"
    } else {
        "long"
    }
}

/// Returns the average length of a slice of strings.
pub fn average_length(items: &[&str]) -> f64 {
    if items.is_empty() {
        return 0.0;
    }
    let total: usize = items.iter().map(|s| s.len()).sum();
    total as f64 / items.len() as f64
}

pub fn longest_item<'a>(items: &'a [&'a str]) -> Option<&'a str> {
    let mut longest: Option<&str> = None;
    for item in items {
        match longest {
            Some(current) if current.len() >= item.len() => {}
            _ => longest = Some(*item),
        }
    }
    longest
}

pub fn shortest_item<'a>(items: &'a [&'a str]) -> Option<&'a str> {
    let mut shortest: Option<&str> = None;
    for item in items {
        match shortest {
            Some(current) if current.len() <= item.len() => {}
            _ => shortest = Some(*item),
        }
    }
    shortest
}

pub fn count_empty(items: &[&str]) -> usize {
    let mut count = 0;
    for item in items {
        if item.is_empty() {
            count += 1;
        }
    }
    count
}

pub fn count_non_empty(items: &[&str]) -> usize {
    let mut count = 0;
    for item in items {
        if !item.is_empty() {
            count += 1;
        }
    }
    count
}

pub fn has_long_note(items: &[&str]) -> bool {
    for item in items {
        if categorize_length(item) == "long" {
            return true;
        }
    }
    false
}

pub fn readability_bucket(text: &str) -> &'static str {
    let mut words = 0;
    let mut long_words = 0;
    let mut punctuation = 0;
    let mut digits = 0;
    let mut uppercase = 0;
    let mut lowercase = 0;

    for word in text.split_whitespace() {
        words += 1;
        if word.len() > 12 {
            long_words += 1;
        }
    }

    for character in text.chars() {
        if character.is_ascii_punctuation() {
            punctuation += 1;
        }
        if character.is_ascii_digit() {
            digits += 1;
        }
        if character.is_ascii_uppercase() {
            uppercase += 1;
        }
        if character.is_ascii_lowercase() {
            lowercase += 1;
        }
    }

    if text.is_empty() {
        return "empty";
    }
    if words == 0 {
        return "symbolic";
    }
    if digits > words && punctuation > words {
        return "noisy";
    }
    if long_words > words / 2 {
        return "dense";
    }
    if uppercase > lowercase * 2 {
        return "loud";
    }
    if punctuation == 0 && words < 4 {
        return "plain";
    }
    if words > 20 && long_words == 0 {
        return "narrative";
    }
    if digits > 0 {
        return "mixed";
    }
    "standard"
}

pub fn needs_review(text: &str) -> bool {
    match readability_bucket(text) {
        "empty" => true,
        "symbolic" => true,
        "noisy" => true,
        "dense" => true,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn categorizes_empty() {
        assert_eq!(categorize_length(""), "empty");
    }

    #[test]
    fn categorizes_short() {
        assert_eq!(categorize_length("hi"), "short");
    }
}
