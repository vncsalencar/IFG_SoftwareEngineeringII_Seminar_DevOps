/// Returns true when the title contains at least one non-whitespace character.
pub fn is_valid_title(title: &str) -> bool {
    !title.trim().is_empty()
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn whitespace_only_titles_are_invalid(s in r"\s*") {
            prop_assert!(!is_valid_title(&s));
        }

        #[test]
        fn titles_with_non_whitespace_are_valid(s in r".*\S.*") {
            prop_assert!(is_valid_title(&s));
        }
    }

    #[test]
    fn empty_string_is_invalid() {
        assert!(!is_valid_title(""));
    }

    #[test]
    fn single_space_is_invalid() {
        assert!(!is_valid_title(" "));
    }

    #[test]
    fn regular_title_is_valid() {
        assert!(is_valid_title("Hello"));
    }
}
